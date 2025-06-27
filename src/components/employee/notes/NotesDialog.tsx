
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNotes } from '@/hooks/use-notes';
import { Plus, MessageSquare } from 'lucide-react';
import AddNoteForm from './AddNoteForm';
import NoteCard from './NoteCard';

interface NotesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  employeeName: string;
}

const NotesDialog: React.FC<NotesDialogProps> = ({
  isOpen,
  onClose,
  profileId,
  employeeName
}) => {
  const {
    notes,
    categories,
    isLoading,
    isAddingNote,
    isUpdatingNote,
    addNote,
    updateNote,
    deleteNote
  } = useNotes(profileId);

  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddNote = async (noteData: {
    profile_id: string;
    title: string;
    content?: string;
    category_id?: string;
  }) => {
    await addNote(noteData);
    setShowAddForm(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Notes for {employeeName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add Note Button */}
          {!showAddForm && (
            <Button
              onClick={() => setShowAddForm(true)}
              className="w-full"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Note
            </Button>
          )}

          {/* Add Note Form */}
          {showAddForm && (
            <AddNoteForm
              categories={categories}
              isAddingNote={isAddingNote}
              onAdd={handleAddNote}
              onCancel={() => setShowAddForm(false)}
              profileId={profileId}
            />
          )}

          {/* Notes List */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8">Loading notes...</div>
            ) : notes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No notes found for this employee
              </div>
            ) : (
              notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  categories={categories}
                  isUpdatingNote={isUpdatingNote}
                  onEdit={updateNote}
                  onDelete={deleteNote}
                />
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotesDialog;
