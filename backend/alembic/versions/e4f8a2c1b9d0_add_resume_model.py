"""Add resume model

Revision ID: e4f8a2c1b9d0
Revises: ff1260ef4b66
Create Date: 2026-07-29 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e4f8a2c1b9d0'
down_revision: Union[str, Sequence[str], None] = 'ff1260ef4b66'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('resumes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('company_name', sa.String(), nullable=False),
        sa.Column('job_title', sa.String(), nullable=True),
        sa.Column('job_description', sa.Text(), nullable=True),
        sa.Column('resume_content', sa.Text(), nullable=False),
        sa.Column('ats_score', sa.Float(), nullable=True),
        sa.Column('missing_skills', sa.Text(), nullable=True),
        sa.Column('match_percentage', sa.Float(), nullable=True),
        sa.Column('project_id', sa.Integer(), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_resumes_id'), 'resumes', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_resumes_id'), table_name='resumes')
    op.drop_table('resumes')
