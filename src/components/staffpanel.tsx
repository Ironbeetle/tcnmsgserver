"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import { getItems, getUsers, searchMembers } from "@/lib/actions";
import { Member } from "@/types/member";

interface AppMessage {
    id?: string;
    title: string;
    content: string;
    priority: 'low' | 'medium' | 'high';
    expiryDate?: string;
    isPublished: boolean;
}

function staffpanel(props: any) {
    let [activeTab, setActiveTab] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRecipients, setSelectedRecipients] = useState<Member[]>([]);

    const handleSelectMember = (member: Member) => {
        if (!selectedRecipients.some(r => r.id === member.id)) {
            setSelectedRecipients([...selectedRecipients, member]);
        }
    };

    const handleRemoveMember = (memberId: string) => {
        setSelectedRecipients(selectedRecipients.filter(r => r.id !== memberId));
    };

    const { data: items = [] } = useQuery({
        queryKey: ['fnmember'],
        queryFn: getItems,
    });

    const { data: searchData, isLoading: isSearching } = useQuery({
        queryKey: ['memberSearch', searchTerm],
        queryFn: () => searchMembers(searchTerm),
        enabled: searchTerm.length > 0,
    });

    const MessageComposer = () => {
        const [messageType, setMessageType] = useState<'sms' | 'email'>('sms');
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
                formData.append('type', messageType);
                formData.append('message', message);
                formData.append('recipients', JSON.stringify(selectedRecipients));
                
                if (messageType === 'email') {
                    formData.append('subject', subject);
                    attachments.forEach(file => {
                        formData.append('attachments', file);
                    });
                }

                const response = await fetch('/api/messages', {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to send message');
                }

                setSendingStatus({
                    success: `Message sent successfully to ${selectedRecipients.length} recipients`
                });

                // Clear form on success
                setMessage('');
                setSubject('');
                setSelectedRecipients([]);
                setAttachments([]);

            } catch (error: any) {
                setSendingStatus({
                    error: error.message || 'Failed to send message'
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
                            Message Type
                        </label>
                        <div className="flex space-x-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    value="sms"
                                    checked={messageType === 'sms'}
                                    onChange={(e) => setMessageType(e.target.value as 'sms')}
                                    className="form-radio h-4 w-4 text-blue-600"
                                />
                                <span className="ml-2">SMS</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    value="email"
                                    checked={messageType === 'email'}
                                    onChange={(e) => setMessageType(e.target.value as 'email')}
                                    className="form-radio h-4 w-4 text-blue-600"
                                />
                                <span className="ml-2">Email</span>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Recipients ({selectedRecipients.length})
                        </label>
                        <div className="border rounded-md p-2 max-h-32 overflow-y-auto">
                            {selectedRecipients.map((member) => (
                                <div key={member.id} className="flex items-center justify-between p-1 hover:bg-gray-100">
                                    <span className="text-sm">
                                        {member.first_name} {member.last_name} - {messageType === 'email' ? member.email : member.contact_number}
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

                    {messageType === 'email' && (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Subject
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full rounded-md border border-gray-300 p-2"
                                placeholder="Enter subject..."
                            />
                        </div>
                    )}

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
                            maxLength={messageType === 'sms' ? 160 : 5000}
                        />
                        <div className="text-right text-sm text-gray-500">
                            {message.length}/{messageType === 'sms' ? '160' : '5000'} characters
                        </div>
                    </div>

                    {messageType === 'email' && (
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
                    )}

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
                                setSubject('');
                                setSelectedRecipients([]);
                                setAttachments([]);
                                setSendingStatus({});
                            }}
                        >
                            Clear
                        </Button>
                        <Button 
                            type="submit"
                            disabled={
                                !message.trim() || 
                                selectedRecipients.length === 0 || 
                                isSending || 
                                (messageType === 'email' && !subject.trim())
                            }
                        >
                            {isSending ? 'Sending...' : 'Send Message'}
                        </Button>
                    </div>
                </form>
            </div>
        );
    };

    const Messages = () => {
        const { data: messages = [], isLoading } = useQuery({
            queryKey: ['messages'],
            queryFn: async () => {
                const response = await fetch('/api/messages');
                if (!response.ok) throw new Error('Failed to fetch messages');
                return response.json();
            },
        });

        if (isLoading) return <div>Loading...</div>;

        return (
            <div className="w-full max-w-2xl p-4">
                <h2 className="text-xl font-bold mb-4">Message History</h2>
                <div className="space-y-4">
                    {messages.map((msg: any) => (
                        <div key={msg.id} className="border rounded-lg p-4">
                            <div className="flex justify-between">
                                <span className="font-medium">{msg.type.toUpperCase()}</span>
                                <span className="text-gray-500">{new Date(msg.created).toLocaleString()}</span>
                            </div>
                            <p className="mt-2">{msg.message}</p>
                            <div className="mt-2 text-sm text-gray-500">
                                Sent to {msg.recipients.length} recipients
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const AppMessageComposer = () => {
        const [message, setMessage] = useState<AppMessage>({
            title: '',
            content: '',
            priority: 'low',
            isPublished: false
        });
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
                const response = await fetch('/api/app-messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(message),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to publish message');
                }

                setSendingStatus({
                    success: 'Message published successfully'
                });

                // Clear form
                setMessage({
                    title: '',
                    content: '',
                    priority: 'low',
                    isPublished: false
                });

            } catch (error: any) {
                setSendingStatus({
                    error: error.message || 'Failed to publish message'
                });
            } finally {
                setIsSending(false);
            }
        };

        return (
            <div className="w-full max-w-2xl p-4">
                <h2 className="text-xl font-bold mb-4">App Message Composer</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Title
                        </label>
                        <input
                            type="text"
                            value={message.title}
                            onChange={(e) => setMessage({ ...message, title: e.target.value })}
                            className="w-full rounded-md border border-gray-300 p-2"
                            placeholder="Enter message title..."
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Content
                        </label>
                        <textarea
                            value={message.content}
                            onChange={(e) => setMessage({ ...message, content: e.target.value })}
                            rows={4}
                            className="w-full rounded-md border border-gray-300 p-2"
                            placeholder="Enter message content..."
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Priority
                        </label>
                        <select
                            value={message.priority}
                            onChange={(e) => setMessage({ ...message, priority: e.target.value as 'low' | 'medium' | 'high' })}
                            className="w-full rounded-md border border-gray-300 p-2"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Expiry Date (Optional)
                        </label>
                        <input
                            type="datetime-local"
                            value={message.expiryDate || ''}
                            onChange={(e) => setMessage({ ...message, expiryDate: e.target.value })}
                            className="w-full rounded-md border border-gray-300 p-2"
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={message.isPublished}
                            onChange={(e) => setMessage({ ...message, isPublished: e.target.checked })}
                            className="rounded border-gray-300"
                        />
                        <label className="text-sm text-gray-700">
                            Publish immediately
                        </label>
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
                                setMessage({
                                    title: '',
                                    content: '',
                                    priority: 'low',
                                    isPublished: false
                                });
                                setSendingStatus({});
                            }}
                        >
                            Clear
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSending || !message.title || !message.content}
                        >
                            {isSending ? 'Publishing...' : 'Publish Message'}
                        </Button>
                    </div>
                </form>
            </div>
        );
    };

    return (
        <>
            <div className="flex flex-col justify-evenly items-center h-full w-full">
                
                <div className="grid grid-cols-5 w-full h-full">
                    <div className="col-span-3 h-full">
                        <div className="flex flex-row justify-evenly mb-4 mt-4">
                            <Button
                                variant={activeTab === 1 ? "default" : "outline"}
                                onClick={() => setActiveTab(1)}
                            >
                                SMS/Email
                            </Button>
                           
                            <Button
                                variant={activeTab === 3 ? "default" : "outline"}
                                onClick={() => setActiveTab(3)}
                            >
                                App Messages
                            </Button>
                        </div>
                        <div className='flex flex-col items-center justify-center'>
                            {activeTab === 1 && <MessageComposer />}
                            {activeTab === 2 && <Messages />}
                            {activeTab === 3 && <AppMessageComposer />}
                        </div>
                    </div>
                    <div className="col-span-2 h-full border-l-4 border-white border-solid overflow-y-hidden">
                        <div className="flex flex-col justify-evenly p-4">
                            <div className="text-xl font-bold mb-4 text-white">
                                Client Search
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search members..."
                                className="w-full px-3 py-2 mt-2 rounded-md border border-gray-300"
                            />
                            {searchTerm.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {searchData?.map((member) => (
                                        <div
                                            key={member.id}
                                            className="flex items-center justify-between p-2 bg-white rounded-md cursor-pointer hover:bg-gray-50"
                                            onClick={() => handleSelectMember(member as Member)}
                                        >
                                            <span>
                                                {member.first_name} {member.last_name}
                                            </span>
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
