"use client";
import {useState, useEffect} from "react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, createUser, updateUser, deleteUser } from "@/lib/actions";
function adminpanel(props: any) {
    let [activeTab, setActiveTab] = useState(1);
    const queryClient = useQueryClient();

    // Queries and Mutations
    const { data: users = [] } = useQuery({
        queryKey: ['user'],
        queryFn: getUsers,
    });
    
    const addMutation = useMutation({
        mutationFn: createUser,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user'] }),
    });

    const editMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: FormData }) => updateUser(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user'] }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteUser(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user'] }),
    });

    const CreateUser = () => {
        const [formData, setFormData] = useState({
            f_name: '',
            l_name: '',
            email: '',
            password: '',
            role: 'admin'
        });

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            try {
                const form = new FormData();
                Object.entries(formData).forEach(([key, value]) => {
                    form.append(key, value);
                });
                
                await addMutation.mutateAsync(form);
                // Reset form after successful creation
                setFormData({
                    f_name: '',
                    l_name: '',
                    email: '',
                    password: '',
                    role: 'admin'
                });
            } catch (error) {
                console.error('Error creating user:', error);
            }
        };

        return (
            <div className="p-4">
                <h2 className="text-xl font-bold mb-4 text-gray-200">Create New User</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-md font-medium text-gray-50">First Name</label>
                        <input
                            type="text"
                            value={formData.f_name}
                            onChange={(e) => setFormData({...formData, f_name: e.target.value})}
                            className="mt-1 block w-full rounded-md border p-2 "
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-md font-medium text-gray-50">Last Name</label>
                        <input
                            type="text"
                            value={formData.l_name}
                            onChange={(e) => setFormData({...formData, l_name: e.target.value})}
                            className="mt-1 block w-full rounded-md border p-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-50">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="mt-1 block w-full rounded-md border p-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-50">Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="mt-1 block w-full rounded-md border p-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-50">Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                            className="mt-1 block w-full rounded-md border p-2 text-gray-50"
                        >
                            <option value="admin">Admin</option>
                            <option value="staff">Staff</option>
                        </select>
                    </div>
                    <Button 
                        type="submit" 
                        disabled={addMutation.isPending}
                    >
                        {addMutation.isPending ? 'Creating...' : 'Create User'}
                    </Button>
                </form>
                {addMutation.isError && (
                    <div className="mt-4 text-red-600">
                        Error creating user: {addMutation.error.message}
                    </div>
                )}
                {addMutation.isSuccess && (
                    <div className="mt-4 text-green-600">
                        User created successfully!
                    </div>
                )}
            </div>
        );
    };

    const EditUser = () => {
        const [selectedUser, setSelectedUser] = useState<string | null>(null);
        const [formData, setFormData] = useState({
            f_name: '',
            l_name: '',
            email: '',
            password: '',
            role: 'admin'
        });

        // Update form data when a user is selected
        useEffect(() => {
            if (selectedUser) {
                const user = users.find((u: any) => u.id === selectedUser);
                if (user) {
                    setFormData({
                        f_name: user.f_name || '',
                        l_name: user.l_name || '',
                        email: user.email || '',
                        password: '', // Don't populate password for security
                        role: user.role || 'admin'
                    });
                }
            }
        }, [selectedUser]);

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!selectedUser) return;

            try {
                const form = new FormData();
                Object.entries(formData).forEach(([key, value]) => {
                    form.append(key, value);
                });
                
                await editMutation.mutateAsync({ id: selectedUser, data: form });
                // Reset form and selection after successful update
                setSelectedUser(null);
                setFormData({
                    f_name: '',
                    l_name: '',
                    email: '',
                    password: '',
                    role: 'admin'
                });
            } catch (error) {
                console.error('Error updating user:', error);
            }
        };

        const handleDelete = async (userId: string) => {
            if (window.confirm('Are you sure you want to delete this user?')) {
                try {
                    await deleteMutation.mutateAsync(userId);
                    setSelectedUser(null);
                } catch (error) {
                    console.error('Error deleting user:', error);
                }
            }
        };

        return (
            <div className="p-4">
                <h2 className="text-xl font-bold mb-4 text-gray-200">Edit User</h2>
                
                {/* User Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2 text-gray-50">Select User to Edit</label>
                    <select 
                        className="w-full p-2 border rounded text-gray-50"
                        value={selectedUser || ''}
                        onChange={(e) => setSelectedUser(e.target.value)}
                    >
                        <option value="">Select a user...</option>
                        {users.map((user: any) => (
                            <option key={user.id} value={user.id}>
                                {user.f_name} {user.l_name} - {user.email}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedUser && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-50">First Name</label>
                            <input
                                type="text"
                                value={formData.f_name}
                                onChange={(e) => setFormData({...formData, f_name: e.target.value})}
                                className="mt-1 block w-full rounded-md border p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-50">Last Name</label>
                            <input
                                type="text"
                                value={formData.l_name}
                                onChange={(e) => setFormData({...formData, l_name: e.target.value})}
                                className="mt-1 block w-full rounded-md border p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-50">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="mt-1 block w-full rounded-md border p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-50">Password</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                className="mt-1 block w-full rounded-md border p-2"
                                placeholder="Leave blank to keep current password"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-50">Role</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                className="mt-1 block w-full rounded-md border p-2"
                            >
                                <option value="admin">Admin</option>
                                <option value="staff">Staff</option>
                            </select>
                        </div>
                        <div className="flex space-x-4">
                            <Button 
                                type="submit" 
                                disabled={editMutation.isPending}
                            >
                                {editMutation.isPending ? 'Updating...' : 'Update User'}
                            </Button>
                            <Button 
                                type="button"
                                variant="destructive"
                                onClick={() => handleDelete(selectedUser)}
                                disabled={deleteMutation.isPending}
                            >
                                {deleteMutation.isPending ? 'Deleting...' : 'Delete User'}
                            </Button>
                        </div>
                    </form>
                )}

                {editMutation.isError && (
                    <div className="mt-4 text-red-600">
                        Error updating user: {editMutation.error.message}
                    </div>
                )}
                {editMutation.isSuccess && (
                    <div className="mt-4 text-green-600">
                        User updated successfully!
                    </div>
                )}
                {deleteMutation.isError && (
                    <div className="mt-4 text-red-600">
                        Error deleting user: {deleteMutation.error.message}
                    </div>
                )}
                {deleteMutation.isSuccess && (
                    <div className="mt-4 text-green-600">
                        User deleted successfully!
                    </div>
                )}
            </div>
        );
    };

    const ViewUser = () => {
        const { data: users = [] } = useQuery({
            queryKey: ['user'],
            queryFn: getUsers,
        });
        const [selectedUser, setSelectedUser] = useState<string | null>(null);
        const [userStats, setUserStats] = useState<any>(null);

        useEffect(() => {
            if (selectedUser) {
                // Fetch user sessions and stats
                fetch(`/api/users/${selectedUser}/stats`)
                    .then(res => res.json())
                    .then(data => setUserStats(data))
                    .catch(error => console.error('Error fetching user stats:', error));
            }
        }, [selectedUser]);

        return (
            <div className="p-4">
                <h2 className="text-xl font-bold mb-4">User Statistics</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                        <h3 className="font-medium mb-2">Select User</h3>
                        <select 
                            className="w-full p-2 border rounded"
                            value={selectedUser || ''}
                            onChange={(e) => setSelectedUser(e.target.value)}
                        >
                            <option value="">Select a user...</option>
                            {users.map((user: any) => (
                                <option key={user.id} value={user.id}>
                                    {user.f_name} {user.l_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {selectedUser && userStats && (
                        <div className="border rounded-lg p-4">
                            <h3 className="font-medium mb-2">Session Statistics</h3>
                            <div className="space-y-2">
                                <p>Total Sessions: {userStats.totalSessions}</p>
                                <p>Last Login: {new Date(userStats.lastLogin).toLocaleString()}</p>
                                <p>Average Session Duration: {userStats.avgSessionDuration}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };
    return (
        <>    
            <div className="flex flex-col justify-evenly items-center h-full w-full">
                <div className="grid grid-cols-2 h-1/8 w-full border-b-4 border-white border-solid">
                    <div className="flex flex-col justify-center items-center">
                        <Button variant="outline" className={activeTab === 1 ? 'active' : ''} onClick={() => setActiveTab(1)} style={{width:"50%"}}>
                            <div className="apptext">
                                Create User
                            </div>
                        </Button>
                      
                    </div>
                    <div className="flex flex-col justify-center">
                       
                        <Button variant="outline" className={activeTab === 2 ? 'active' : ''} onClick={() => setActiveTab(2)} style={{width:"50%"}}>
                            <div className="apptextB">
                                Edit User List
                            </div>
                        </Button>
                    </div>
                </div>
                
                <div className="flex flex-col justify-evenly w-full h-7/8">
                    <div className="w-1/2 h-full p-6">
                        {activeTab === 1 && <CreateUser />}
                        {activeTab === 2 && <EditUser />}
                    </div>
                   
                </div>
           </div>
        </>
    );
}
export default adminpanel;
  
