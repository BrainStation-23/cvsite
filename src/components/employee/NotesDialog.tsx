
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNotes } from '@/hooks/use-notes';
import { Plus, Calendar, User, Edit, Trash2, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
    addNote,
    updateNote,
    deleteNote
  } = useNotes(profileId);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category_id: ''
  });

  const handleAddNote = async () => {
    if (!newNote.title.trim()) return;

    await addNote({
      profile_id: profileId,
      title: newNote.title,
      content: newNote.content,
      category_id: newNote.category_id || undefined
    });

    setNewNote({ title: '', content: '', category_id: '' });
    setShowAddForm(false);
  };

  const handleUpdateNote = async (noteId: string, updates: any) => {
    await updateNote(noteId, updates);
    setEditingNote(null);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await deleteNote(noteId);
    }
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add New Note</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    value={newNote.title}
                    onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter note title"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={newNote.category_id}
                    onValueChange={(value) => setNewNote(prev => ({ ...prev, category_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Content</label>
                  <Textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter note content"
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleAddNote}
                    disabled={!newNote.title.trim() || isAddingNote}
                  >
                    {isAddingNote ? 'Adding...' : 'Add Note'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewNote({ title: '', content: '', category_id: '' });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
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
                <Card key={note.id} className="relative">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">
                          {note.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                          {note.category && (
                            <Badge variant="secondary" className="text-xs">
                              {note.category.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingNote(note.id)}
                          className="h-7 w-7 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNote(note.id)}
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {note.content && (
                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotesDialog;
