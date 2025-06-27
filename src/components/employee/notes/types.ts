
export interface NoteFormData {
  title: string;
  content: string;
  category_id: string;
}

export interface NoteCardProps {
  note: any;
  categories: any[];
  isUpdatingNote: boolean;
  onEdit: (noteId: string, updates: Partial<NoteFormData>) => Promise<void>;
  onDelete: (noteId: string) => Promise<void>;
}

export interface AddNoteFormProps {
  categories: any[];
  isAddingNote: boolean;
  onAdd: (noteData: {
    profile_id: string;
    title: string;
    content?: string;
    category_id?: string;
  }) => Promise<void>;
  onCancel: () => void;
  profileId: string;
}
