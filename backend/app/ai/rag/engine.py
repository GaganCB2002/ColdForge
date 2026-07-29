from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from app.config import settings
import os

class RAGEngine:
    def __init__(self):
        # We use a lightweight BAAI embedding model that runs well locally
        self.embeddings = HuggingFaceEmbeddings(
            model_name=settings.EMBEDDING_MODEL,
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=100,
            length_function=len
        )
        self.vector_store_dir = "faiss_index"

    def load_document(self, filepath: str):
        ext = os.path.splitext(filepath)[1].lower()
        if ext == '.pdf':
            loader = PyPDFLoader(filepath)
        elif ext in ['.docx', '.doc']:
            loader = Docx2txtLoader(filepath)
        elif ext in ['.txt', '.csv', '.md']:
            loader = TextLoader(filepath)
        else:
            raise ValueError(f"Unsupported file format: {ext}")
        return loader.load()

    def add_document_to_index(self, filepath: str, project_id: int):
        """
        Parses a document, chunks it, and adds it to the FAISS index for a specific project.
        """
        docs = self.load_document(filepath)
        chunks = self.text_splitter.split_documents(docs)
        
        # Add metadata to chunks so we can filter by project later
        for chunk in chunks:
            chunk.metadata['project_id'] = project_id
            chunk.metadata['source_file'] = os.path.basename(filepath)

        index_path = f"{self.vector_store_dir}/project_{project_id}"
        
        if os.path.exists(index_path):
            vectorstore = FAISS.load_local(index_path, self.embeddings, allow_dangerous_deserialization=True)
            vectorstore.add_documents(chunks)
        else:
            vectorstore = FAISS.from_documents(chunks, self.embeddings)
            os.makedirs(self.vector_store_dir, exist_ok=True)
            
        vectorstore.save_local(index_path)
        return True

    def retrieve_context(self, query: str, project_id: int, top_k: int = 3):
        """
        Retrieves relevant context for a query within a specific project.
        """
        index_path = f"{self.vector_store_dir}/project_{project_id}"
        if not os.path.exists(index_path):
            return ""

        vectorstore = FAISS.load_local(index_path, self.embeddings, allow_dangerous_deserialization=True)
        retriever = vectorstore.as_retriever(search_kwargs={"k": top_k})
        docs = retriever.invoke(query)
        
        context = "\n\n".join([doc.page_content for doc in docs])
        return context

rag_engine = RAGEngine()
