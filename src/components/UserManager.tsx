
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { useToast } from '../hooks/use-toast';
import { Edit, Trash2, Users, UserCheck, UserX } from 'lucide-react';

interface User {
  uid: string;
  email: string;
  name: string;
  isAdmin: boolean;
  profileImage?: string;
}

interface UserManagerProps {
  onBack: () => void;
}

export const UserManager: React.FC<UserManagerProps> = ({ onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', isAdmin: false });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        ...doc.data(),
        uid: doc.id
      })) as User[];
      
      setUsers(usersData.sort((a, b) => a.name.localeCompare(b.name)));
      console.log('Fetched users:', usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    try {
      const userRef = doc(db, 'users', editingUser.uid);
      await updateDoc(userRef, {
        name: editForm.name,
        email: editForm.email,
        isAdmin: editForm.isAdmin
      });

      // Update local state
      setUsers(users.map(user => 
        user.uid === editingUser.uid 
          ? { ...user, ...editForm }
          : user
      ));

      setIsEditDialogOpen(false);
      setEditingUser(null);
      
      toast({
        title: "Success",
        description: "User updated successfully"
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to delete user "${user.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', user.uid));
      
      // Update local state
      setUsers(users.filter(u => u.uid !== user.uid));
      
      toast({
        title: "Success",
        description: "User deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="border-gray-600 text-white hover:bg-gray-800"
          >
            ← Back to Dashboard
          </Button>
          <h2 className="text-2xl font-bold text-white">User Management</h2>
        </div>
        <div className="text-center text-white py-8">
          <div className="text-lg">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={onBack}
          variant="outline"
          size="sm"
          className="border-gray-600 text-white hover:bg-gray-800"
        >
          ← Back to Dashboard
        </Button>
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <div className="ml-auto flex items-center gap-2 text-gray-400">
          <Users size={20} />
          <span>{users.length} users</span>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <Users size={48} className="mx-auto mb-4 opacity-50" />
          <div className="text-lg">No users found</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">User</TableHead>
                <TableHead className="text-gray-300">Email</TableHead>
                <TableHead className="text-gray-300">Role</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.uid} className="border-gray-700 hover:bg-gray-800">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {user.profileImage ? (
                        <img 
                          src={user.profileImage} 
                          alt={user.name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-white font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">{user.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.isAdmin ? (
                        <>
                          <UserCheck size={16} className="text-green-500" />
                          <span className="text-green-400 font-medium">Admin</span>
                        </>
                      ) : (
                        <>
                          <UserX size={16} className="text-gray-500" />
                          <span className="text-gray-400">User</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog open={isEditDialogOpen && editingUser?.uid === user.uid} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            onClick={() => handleEditUser(user)}
                            variant="outline"
                            size="sm"
                            className="border-gray-600 text-white hover:bg-gray-700"
                          >
                            <Edit size={14} />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-900 border-gray-700">
                          <DialogHeader>
                            <DialogTitle className="text-white">Edit User</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="edit-name" className="text-gray-300">Name</Label>
                              <Input
                                id="edit-name"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="bg-gray-800 border-gray-600 text-white"
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-email" className="text-gray-300">Email</Label>
                              <Input
                                id="edit-email"
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                className="bg-gray-800 border-gray-600 text-white"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="edit-admin"
                                checked={editForm.isAdmin}
                                onChange={(e) => setEditForm({ ...editForm, isAdmin: e.target.checked })}
                                className="w-4 h-4"
                              />
                              <Label htmlFor="edit-admin" className="text-gray-300">Admin privileges</Label>
                            </div>
                            <div className="flex gap-2 pt-4">
                              <Button onClick={handleSaveEdit} className="bg-blue-600 hover:bg-blue-700">
                                Save Changes
                              </Button>
                              <Button 
                                onClick={() => setIsEditDialogOpen(false)} 
                                variant="outline"
                                className="border-gray-600 text-white hover:bg-gray-800"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        onClick={() => handleDeleteUser(user)}
                        variant="outline"
                        size="sm"
                        className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
