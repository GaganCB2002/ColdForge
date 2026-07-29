from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Any
import os
import uuid
from app.database import get_db
from app.models.user import User
from app.models.project import Project
from app.models.document import Document
from app.schemas.document import DocumentOut, DocumentUpdate
from app.auth.jwt import get_current_active_user
from app.config import settings
from app.ai.rag.engine import rag_engine

router = APIRouter(prefix="/api/documents", tags=["documents"])

@router.post("/", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_document(
    project_id: int = Form(...),
    doc_type: str = Form("generic"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    # Verify project exists and belongs to user
    project = db.query(Project).filter(
        Project.id == project_id, 
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    os.makedirs(settings.UPLOAD_DIRECTORY, exist_ok=True)
    
    # Generate unique filename to avoid collisions
    ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIRECTORY, unique_filename)
    
    # Save file
    try:
        contents = await file.read()
        with open(filepath, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Could not save file: {e}")
        
    # Process file into RAG FAISS index
    try:
        rag_engine.add_document_to_index(filepath, project_id)
    except Exception as e:
        # cleanup file on failure
        if os.path.exists(filepath):
            os.remove(filepath)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to process document into vector store: {e}")

    # Save document record to DB
    document = Document(
        filename=file.filename,
        filepath=filepath,
        doc_type=doc_type,
        project_id=project_id,
        user_id=current_user.id
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return document

@router.get("/project/{project_id}", response_model=List[DocumentOut])
def get_project_documents(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    # Verify project exists and belongs to user
    project = db.query(Project).filter(
        Project.id == project_id, 
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        
    documents = db.query(Document).filter(Document.project_id == project_id).all()
    return documents

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    document = db.query(Document).filter(
        Document.id == document_id, 
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    
    # Optional: Delete file from disk
    if os.path.exists(document.filepath):
        try:
            os.remove(document.filepath)
        except Exception:
            pass # ignore failure on disk deletion
            
    # Note: We cannot easily remove specific documents from FAISS index without re-indexing.
    # For a production app, we would re-index or use a vector store that supports deletion.
    
    db.delete(document)
    db.commit()
    return None

@router.put("/{document_id}", response_model=DocumentOut)
def update_document(
    document_id: int,
    doc_in: DocumentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    document = db.query(Document).filter(
        Document.id == document_id, 
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        
    document.filename = doc_in.filename
    db.commit()
    db.refresh(document)
    return document
