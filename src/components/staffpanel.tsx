"use client";
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getItems, getUsers, searchMembers } from '@/lib/actions';
import { Button } from '@/components/ui/button';

type Member = {
    id: string;
    created: string;  // Changed from Date to string
    updated: string;  // Changed from Date to string
    birthdate: string;  // Changed from Date to string
    first_name: string;
    last_name: string;
    t_number: string;
    gender: string;
    o_r_status: string;
    house_number: string;
    community: string;
    contact_number: string;
    option: string;
    email: string | null;
};
function staffpanel(props: any) {
    let [activeTab, setActiveTab] = useState(1);
    let [activeTab2, setActiveTab2] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Member[]>([]);
    const [selectedRecipients, setSelectedRecipients] = useState<Member[]>([]);

    // Function to handle member selection
    const handleSelectMember = (member: Member) => {
        // Check if member is already selected
        if (!selectedRecipients.some(r => r.id === member.id)) {
            setSelectedRecipients([...selectedRecipients, member]);
        }
    };

    // Function to handle member removal
    const handleRemoveMember = (memberId: string) => {
        setSelectedRecipients(selectedRecipients.filter(r => r.id !== memberId));
    };

    const { data: items = [] } = useQuery({
      queryKey: ['fnmember'],
      queryFn: getItems,
    });
    const { data: staffitems = [] } = useQuery({
        queryKey: ['user'],
        queryFn: getUsers,
      });
    const { data: searchData, isLoading: isSearching } = useQuery({
        queryKey: ['memberSearch', searchTerm],
        queryFn: () => searchMembers(searchTerm),
        enabled: searchTerm.length > 0,
    });
    const Textcompose = () => {
        const [message, setMessage] = useState('');
        const [isSending, setIsSending] = useState(false);
        const [sendingStatus, setSendingStatus] = useState<{
            success?: string;
            error?: string;
        }>({});

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setIsSending(true);
            setSendingStatus({});

            try {
                const response = await fetch('/api/send-sms', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        recipients: selectedRecipients,
                        message: message
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to send SMS');
                }

                // Calculate success and failure counts
                const successCount = data.results.filter((r: any) => r.success).length;
                const failureCount = data.results.filter((r: any) => !r.success).length;

                setSendingStatus({
                    success: `Successfully sent ${successCount} messages${failureCount > 0 ? `, ${failureCount} failed` : ''}`
                });

                // Clear form on success
                if (failureCount === 0) {
                    setMessage('');
                    setSelectedRecipients([]);
                }

            } catch (error: any) {
                setSendingStatus({
                    error: error.message || 'Failed to send SMS'
                });
            } finally {
                setIsSending(false);
            }
        };

        return (
            <div className="w-full max-w-2xl p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Recipients ({selectedRecipients.length})
                        </label>
                        <div className="border rounded-md p-2 max-h-32 overflow-y-auto">
                            {selectedRecipients.map((member) => (
                                <div key={member.id} className="flex items-center justify-between p-1 hover:bg-gray-100">
                                    <span className="text-sm">
                                        {member.first_name} {member.last_name} - {member.contact_number}
                                    </span>
                                    <Button
                                        onClick={() => handleRemoveMember(member.id)}
                                        variant="ghost"
                                        size="sm"
                                    >
                                        ✕
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Message
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="Type your message here..."
                            maxLength={160}
                        />
                        <div className="text-right text-sm text-gray-500">
                            {message.length}/160 characters
                        </div>
                    </div>

                    {sendingStatus.success && (
                        <div className="p-2 bg-green-100 text-green-700 rounded">
                            {sendingStatus.success}
                        </div>
                    )}

                    {sendingStatus.error && (
                        <div className="p-2 bg-red-100 text-red-700 rounded">
                            {sendingStatus.error}
                        </div>
                    )}

                    <div className="flex justify-end space-x-2">
                        <Button 
                            variant="outline" 
                            type="button"
                            disabled={isSending}
                            onClick={() => {
                                setMessage('');
                                setSelectedRecipients([]);
                                setSendingStatus({});
                            }}
                        >
                            Clear
                        </Button>
                        <Button 
                            type="submit"
                            disabled={!message.trim() || selectedRecipients.length === 0 || isSending}
                        >
                            {isSending ? 'Sending...' : 'Send SMS'}
                        </Button>
                    </div>
                </form>
            </div>
        );
    };
    const Notifications = () => {
        const [title, setTitle] = useState('');
        const [message, setMessage] = useState('');
        const [icon, setIcon] = useState<File | null>(null);
        const [isSending, setIsSending] = useState(false);

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setIsSending(true);

            try {
                const formData = new FormData();
                formData.append('title', title);
                formData.append('message', message);
                formData.append('recipients', JSON.stringify(selectedRecipients));
                if (icon) {
                    formData.append('icon', icon);
                }

                const response = await fetch('/api/send-notification', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Failed to send notification');
                }

                // Clear form on success
                setTitle('');
                setMessage('');
                setSelectedRecipients([]);
                setIcon(null);

            } catch (error) {
                console.error('Failed to send notification:', error);
            } finally {
                setIsSending(false);
            }
        };

        const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                if (file.type.startsWith('image/')) {
                    setIcon(file);
                } else {
                    alert('Please select an image file');
                }
            }
        };

        return (
            <div className="w-full max-w-2xl p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Recipients
                        </label>
                        <div className="border rounded-md p-2 max-h-32 overflow-y-auto">
                            {selectedRecipients.map((member) => (
                                <div key={member.id} className="flex items-center justify-between p-1 hover:bg-gray-100">
                                    <span className="text-sm">
                                        {member.first_name} {member.last_name}
                                    </span>
                                    <Button
                                        onClick={() => handleRemoveMember(member.id)}
                                        variant="ghost"
                                        size="sm"
                                    >
                                        ✕
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Notification Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="Enter notification title..."
                            maxLength={50}
                        />
                        <div className="text-right text-sm text-gray-500">
                            {title.length}/50 characters
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Message
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="Type your notification message here..."
                            maxLength={200}
                        />
                        <div className="text-right text-sm text-gray-500">
                            {message.length}/200 characters
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Notification Icon
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleIconChange}
                            className="w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                        />
                        {icon && (
                            <div className="mt-2">
                                <img 
                                    src={URL.createObjectURL(icon)} 
                                    alt="Notification icon preview" 
                                    className="w-16 h-16 object-cover rounded"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button 
                            variant="outline" 
                            type="button"
                            disabled={isSending}
                            onClick={() => {
                                setTitle('');
                                setMessage('');
                                setSelectedRecipients([]);
                                setIcon(null);
                            }}
                        >
                            Clear
                        </Button>
                        <Button 
                            type="submit"
                            disabled={!title.trim() || !message.trim() || selectedRecipients.length === 0 || isSending}
                        >
                            {isSearching ? 'Sending...' : 'Send Notification'}
                        </Button>
                    </div>
                </form>
            </div>
        );
    };
    const Emailcompose = () => {
        const [subject, setSubject] = useState('');
        const [message, setMessage] = useState('');
        const [attachments, setAttachments] = useState<File[]>([]);
        const [isSending, setIsSending] = useState(false);
        const [sendingStatus, setSendingStatus] = useState<{
            success?: string;
            error?: string;
        }>({});

        const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = Array.from(e.target.files || []);
            setAttachments(prev => [...prev, ...files]);
        };

        const removeAttachment = (index: number) => {
            setAttachments(prev => prev.filter((_, i) => i !== index));
        };

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setIsSending(true);
            setSendingStatus({});

            try {
                const formData = new FormData();
                formData.append('subject', subject);
                formData.append('message', message);
                formData.append('recipients', JSON.stringify(selectedRecipients));
                attachments.forEach(file => {
                    formData.append('attachments', file);
                });

                const response = await fetch('/api/send-email', {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to send email');
                }

                setSendingStatus({
                    success: 'Email sent successfully'
                });

                // Clear form on success
                setSubject('');
                setMessage('');
                setSelectedRecipients([]);
                setAttachments([]);

            } catch (error: any) {
                setSendingStatus({
                    error: error.message || 'Failed to send email'
                });
            } finally {
                setIsSending(false);
            }
        };

        return (
            <div className="w-full max-w-2xl p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Recipients ({selectedRecipients.length})
                        </label>
                        <div className="border rounded-md p-2 max-h-32 overflow-y-auto">
                            {selectedRecipients.map((member) => (
                                <div key={member.id} className="flex items-center justify-between p-1 hover:bg-gray-100">
                                    <span className="text-sm">
                                        {member.first_name} {member.last_name} - {member.email}
                                    </span>
                                    <Button
                                        onClick={() => handleRemoveMember(member.id)}
                                        variant="ghost"
                                        size="sm"
                                    >
                                        ✕
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Subject
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="Enter email subject..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Message
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={8}
                            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="Type your email message here..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Attachments
                        </label>
                        <input
                            type="file"
                            multiple
                            onChange={handleAttachmentChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <div className="mt-2 space-y-2">
                            {attachments.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <span className="text-sm truncate">{file.name}</span>
                                    <Button
                                        onClick={() => removeAttachment(index)}
                                        variant="ghost"
                                        size="sm"
                                    >
                                        ✕
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {sendingStatus.success && (
                        <div className="p-2 bg-green-100 text-green-700 rounded">
                            {sendingStatus.success}
                        </div>
                    )}

                    {sendingStatus.error && (
                        <div className="p-2 bg-red-100 text-red-700 rounded">
                            {sendingStatus.error}
                        </div>
                    )}

                    <div className="flex justify-end space-x-2">
                        <Button 
                            variant="outline" 
                            type="button"
                            disabled={isSending}
                            onClick={() => {
                                setSubject('');
                                setMessage('');
                                setSelectedRecipients([]);
                                setAttachments([]);
                                setSendingStatus({});
                            }}
                        >
                            Clear
                        </Button>
                        <Button 
                            type="submit"
                            disabled={!subject.trim() || !message.trim() || selectedRecipients.length === 0 || isSending}
                        >
                            {isSending ? 'Sending...' : 'Send Email'}
                        </Button>
                    </div>
                </form>
            </div>
        );
    };
    const Messenger = () => {
        return (
            <>
                <div className='flex flex-col items-center justify-center'>
                    <div className='apptextBlack'>
                        Message Compose
                    </div>
                </div>
                <div className='grid grid-cols-2 w-full border-b-4 border-white border-solid'>
                    <div className='flex flex-row items-center justify-evenly'>
                        <button className={activeTab2 === 1 ? 'active' : ''} onClick={() => setActiveTab2(1)}>
                            <div className="apptextB">
                                Text Msg
                            </div>
                        </button>
                        <button className={activeTab2 === 2 ? 'active' : ''} onClick={() => setActiveTab2(2)}>
                            <div className="apptextB">
                                Notifications
                            </div>
                        </button>
                        <button className={activeTab2 === 3 ? 'active' : ''} onClick={() => setActiveTab2(3)}>
                            <div className="apptextB">
                                Email
                            </div>
                        </button>
                    </div>
                    <div className='flex flex-col items-center justify-center'>
                        
                    </div>
                </div>
                <div className='flex flex-col items-center justify-center'>
                    {activeTab2 === 1 && <Textcompose/>}
                    {activeTab2 === 2 && <Notifications/>}
                    {activeTab2 === 3 && <Emailcompose/>}
                </div>
            </>
        );
    };
    const Messages = () => {
        return (
            <div>
                <h1>Messages</h1>
            </div>
        );
    };
    return (
        <>
           <div className="flex flex-col justify-evenly items-center h-full w-full">
                <div className="grid grid-cols-5 w-full h-full">
                    <div className="col-span-3 h-full">
                        <div className='flex flex-col items-center justify-center'>
                            {activeTab === 1 && <Messenger/>}
                            {activeTab === 2 && <Messages/>}
                        </div>
                    </div>
                    <div className="col-span-2 h-full border-l-4 border-white border-solid overflow-y-hidden">
                        <div className="flex flex-col justify-evenly border-b-4 border-white border-solid p-4">
                            <div className="apptextB">
                                Client Search
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search members..."
                                className="w-full px-3 py-2 mt-2 rounded-md border border-gray-300"
                            />
                        </div>
                        <div className="w-full p-2 overflow-y-hidden">
                            {isSearching ? (
                                <div className="text-center text-white py-4">Searching...</div>
                            ) : !searchData || searchData.length === 0 ? (
                                <div className="text-center text-white py-4">No results found</div>
                            ) : (
                                <div className="space-y-2">
                                    {searchData.slice(0, 7).map((member: Member) => (
                                        <div
                                            key={member.id}
                                            className="bg-white bg-opacity-90 rounded-lg p-3 shadow flex justify-between items-center"
                                            onClick={() => handleSelectMember(member)}
                                        >
                                            <div>
                                                <div className="font-medium">
                                                    {member.first_name} {member.last_name}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {member.contact_number}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
           </div>
        </>
    );
}
export default staffpanel;
  
