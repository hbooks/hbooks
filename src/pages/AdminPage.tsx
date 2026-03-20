import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Session } from '@supabase/supabase-js';
import { format } from 'date-fns';
import {
  LogOut,
  Database,
  Eye,
  EyeOff,
  Save,
  X,
  Trash2,
  Plus,
  Edit2,
  Upload,
  CheckCircle,
  AlertCircle,
  User,
  Clock,
  Image as ImageIcon,
} from 'lucide-react';

type TableName = 'books' | 'news_posts' | 'upcoming_books' | 'reviews' | 'contact_messages' | 'admin_logs';

interface Column {
  name: string;
  type: string;
}

const BUCKET_NAME = 'covers';

const AdminPage = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTable, setActiveTable] = useState<TableName>('books');
  const [tableData, setTableData] = useState<any[]>([]);
  const [tableColumns, setTableColumns] = useState<Column[]>([]);
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [newRow, setNewRow] = useState<any | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | null }>({ message: '', type: null });
  const [logoutPopup, setLogoutPopup] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const navigate = useNavigate();

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auth check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (session) {
      fetchTableData(activeTable);
      fetchLogs();
    }
  }, [session, activeTable]);

  const fetchTableData = async (table: TableName) => {
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      showToast('error', `Failed to fetch ${table}`);
      return;
    }
    setTableData(data || []);

    if (data && data.length > 0) {
      setTableColumns(Object.keys(data[0]).map(key => ({ name: key, type: typeof data[0][key] })));
    } else {
      const { data: columns } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_name', table)
        .eq('table_schema', 'public');
      if (columns) {
        setTableColumns(columns.map(c => ({ name: c.column_name, type: c.data_type })));
      }
    }
  };

  const fetchLogs = async () => {
    const { data } = await supabase.from('admin_logs').select('*').order('created_at', { ascending: false }).limit(50);
    setLogs(data || []);
  };

  const logAction = async (action: string, table: string, recordId?: number, details?: any) => {
    await supabase.from('admin_logs').insert({
      admin_user: session?.user?.email || 'admin',
      action,
      table_name: table,
      record_id: recordId,
      details,
    });
    fetchLogs();
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: null }), 4000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoginError(error.message);
      showToast('error', 'Login failed');
    } else {
      showToast('success', 'Welcome back, Admin!');
    }
  };

  const handleLogout = async () => {
    setLogoutPopup(true);
  };

  const confirmLogout = async () => {
    await supabase.auth.signOut();
    setLogoutPopup(false);
    showToast('success', 'Logged out successfully');
    navigate('/');
  };

  // File upload handler
  const handleFileUpload = async (file: File, currentRow: any, isNew: boolean) => {
    if (!file || !session) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      if (isNew) {
        setNewRow({ ...newRow, cover_image: publicUrl });
      } else {
        setEditingRow({ ...editingRow, cover_image: publicUrl });
      }
      showToast('success', 'Image uploaded successfully');
    } catch (error: any) {
      showToast('error', `Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleInsert = async () => {
    if (!newRow) return;
    const { data, error } = await supabase.from(activeTable).insert(newRow).select();
    if (error) {
      showToast('error', `Insert failed: ${error.message}`);
      return;
    }
    setNewRow(null);
    fetchTableData(activeTable);
    logAction('INSERT', activeTable, data?.[0]?.id, newRow);
    showToast('success', 'Record added');
  };

  const handleUpdate = async () => {
    if (!editingRow || !editingRow.id) return;
    const { error } = await supabase.from(activeTable).update(editingRow).eq('id', editingRow.id);
    if (error) {
      showToast('error', `Update failed: ${error.message}`);
      return;
    }
    setEditingRow(null);
    fetchTableData(activeTable);
    logAction('UPDATE', activeTable, editingRow.id, editingRow);
    showToast('success', 'Record updated');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    const { error } = await supabase.from(activeTable).delete().eq('id', id);
    if (error) {
      showToast('error', `Delete failed: ${error.message}`);
      return;
    }
    fetchTableData(activeTable);
    logAction('DELETE', activeTable, id);
    showToast('success', 'Record deleted');
  };

  const toggleBoolean = async (row: any, column: string) => {
    const newValue = !row[column];
    const { error } = await supabase.from(activeTable).update({ [column]: newValue }).eq('id', row.id);
    if (error) {
      showToast('error', `Update failed: ${error.message}`);
      return;
    }
    fetchTableData(activeTable);
    logAction('UPDATE', activeTable, row.id, { [column]: newValue });
    showToast('success', `${column} toggled`);
  };

  const isImageColumn = (colName: string) => colName === 'cover_image';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-gold text-xl animate-pulse">Loading admin panel...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-gold rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-40 left-20 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 w-full max-w-md shadow-2xl z-10">
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl text-white">Admin Access</h2>
            <p className="text-gray-300 mt-2">Secure portal for content management</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" variant="hero" className="w-full bg-gold text-black hover:bg-gold/90 transition-all">
              Login
            </Button>
            {loginError && (
              <p className="text-red-400 text-sm text-center bg-red-900/30 p-2 rounded">{loginError}</p>
            )}
          </form>
        </div>

        {/* Toast notifications for login */}
        {toast.type && (
          <div className="fixed bottom-4 right-4 z-50 animate-fade-in-up">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${
              toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}>
              {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              {toast.message}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Custom Admin Header */}
      <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center">
              <User size={20} className="text-black" />
            </div>
            <div>
              <h1 className="font-display text-xl text-white">Admin Dashboard</h1>
              <p className="text-xs text-gray-400">Welcome, {session.user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 text-gray-300">
              <Clock size={16} />
              <span className="text-sm font-mono">{format(currentTime, 'HH:mm:ss')}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLogs(!showLogs)}
              className="text-gray-300 hover:text-white"
            >
              <Database size={16} className="mr-2" />
              {showLogs ? 'Hide Logs' : 'Show Logs'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-300 hover:text-white"
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Table Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['books', 'news_posts', 'upcoming_books', 'reviews', 'contact_messages', 'admin_logs'] as TableName[]).map(table => (
            <button
              key={table}
              onClick={() => setActiveTable(table)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeTable === table
                  ? 'bg-gold text-black shadow-lg'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {table.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Logs Panel */}
        {showLogs && (
          <div className="bg-gray-800 rounded-xl p-4 mb-6 max-h-80 overflow-auto border border-gray-700">
            <h3 className="font-display text-lg text-gold mb-3">Recent Activity</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 text-gray-400">Time</th>
                    <th className="text-left text-gray-400">Action</th>
                    <th className="text-left text-gray-400">Table</th>
                    <th className="text-left text-gray-400">Record ID</th>
                    <th className="text-left text-gray-400">Details</th>
                   </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id} className="border-b border-gray-700/50">
                      <td className="py-2 text-gray-300">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="py-2 text-gray-300">{log.action}</td>
                      <td className="py-2 text-gray-300">{log.table_name}</td>
                      <td className="py-2 text-gray-300">{log.record_id || '-'}</td>
                      <td className="py-2 text-gray-300 max-w-xs truncate">{JSON.stringify(log.details)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-900">
                <tr>
                  {tableColumns.map(col => (
                    <th key={col.name} className="px-4 py-3 text-left font-semibold text-gray-300 capitalize">
                      {col.name.replace('_', ' ')}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* New row input */}
                {newRow && (
                  <tr className="bg-gray-700/50">
                    {tableColumns.map(col => (
                      <td key={col.name} className="px-4 py-2 border-b border-gray-700">
                        {col.name === 'id' ? (
                          <span className="text-gray-400">auto</span>
                        ) : isImageColumn(col.name) ? (
                          <div className="flex flex-col gap-2">
                            {newRow.cover_image && (
                              <img src={newRow.cover_image} alt="Cover" className="h-12 w-auto object-cover rounded shadow" />
                            )}
                            <div className="flex gap-2 items-center">
                              <label className="cursor-pointer bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                                <Upload size={12} />
                                Upload
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) await handleFileUpload(file, newRow, true);
                                  }}
                                  className="hidden"
                                />
                              </label>
                              {uploading && <span className="text-xs text-gray-400">Uploading...</span>}
                            </div>
                          </div>
                        ) : col.type.includes('bool') ? (
                          <input
                            type="checkbox"
                            checked={newRow[col.name] || false}
                            onChange={e => setNewRow({ ...newRow, [col.name]: e.target.checked })}
                            className="w-4 h-4 accent-gold"
                          />
                        ) : (
                          <input
                            type="text"
                            value={newRow[col.name] || ''}
                            onChange={e => setNewRow({ ...newRow, [col.name]: e.target.value })}
                            className="w-full px-2 py-1 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-1 focus:ring-gold"
                          />
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-2 border-b border-gray-700">
                      <button onClick={handleInsert} className="text-green-400 hover:text-green-300 mr-2" disabled={uploading}>
                        <Save size={16} />
                      </button>
                      <button onClick={() => setNewRow(null)} className="text-red-400 hover:text-red-300">
                        <X size={16} />
                      </button>
                    </td>
                  </tr>
                )}

                {/* Existing rows */}
                {tableData.map(row => (
                  <tr key={row.id} className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors">
                    {tableColumns.map(col => {
                      const isEditing = editingRow?.id === row.id;
                      const value = row[col.name];
                      return (
                        <td key={col.name} className="px-4 py-2">
                          {isEditing ? (
                            col.name === 'id' ? (
                              value
                            ) : isImageColumn(col.name) ? (
                              <div className="flex flex-col gap-2">
                                {editingRow.cover_image && (
                                  <img src={editingRow.cover_image} alt="Cover" className="h-12 w-auto object-cover rounded shadow" />
                                )}
                                <div className="flex gap-2 items-center">
                                  <label className="cursor-pointer bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                                    <Upload size={12} />
                                    Upload
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) await handleFileUpload(file, row, false);
                                      }}
                                      className="hidden"
                                    />
                                  </label>
                                  {uploading && <span className="text-xs text-gray-400">Uploading...</span>}
                                </div>
                              </div>
                            ) : col.type.includes('bool') ? (
                              <input
                                type="checkbox"
                                checked={editingRow[col.name] || false}
                                onChange={e => setEditingRow({ ...editingRow, [col.name]: e.target.checked })}
                                className="w-4 h-4 accent-gold"
                              />
                            ) : (
                              <input
                                type="text"
                                value={editingRow[col.name] || ''}
                                onChange={e => setEditingRow({ ...editingRow, [col.name]: e.target.value })}
                                className="w-full px-2 py-1 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-1 focus:ring-gold"
                              />
                            )
                          ) : (
                            <span className={col.type.includes('bool') ? (value ? 'text-green-400' : 'text-red-400') : 'text-gray-200'}>
                              {isImageColumn(col.name) && value ? (
                                <img src={value} alt="Cover" className="h-12 w-auto object-cover rounded shadow" />
                              ) : col.type.includes('bool') ? (
                                value ? '✅' : '❌'
                              ) : (
                                value?.toString()
                              )}
                            </span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-2">
                      {editingRow?.id === row.id ? (
                        <>
                          <button onClick={handleUpdate} className="text-green-400 hover:text-green-300 mr-2" disabled={uploading}>
                            <Save size={16} />
                          </button>
                          <button onClick={() => setEditingRow(null)} className="text-red-400 hover:text-red-300">
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => setEditingRow(row)} className="text-gold hover:text-gold/80 mr-2">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(row.id)} className="text-red-400 hover:text-red-300 mr-2">
                            <Trash2 size={16} />
                          </button>
                          {activeTable === 'reviews' && (
                            <button
                              onClick={() => toggleBoolean(row, 'approved')}
                              className="text-blue-400 hover:text-blue-300"
                              title="Toggle approved"
                            >
                              {row.approved ? <Eye size={16} /> : <EyeOff size={16} />}
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add new row button */}
        <div className="mt-6">
          <Button variant="hero" size="sm" onClick={() => setNewRow({})} className="bg-gold text-black hover:bg-gold/90">
            <Plus size={16} className="mr-2" />
            Add New Record
          </Button>
        </div>
      </div>

      {/* Logout Popup */}
      {logoutPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-700 animate-scale-in">
            <h3 className="text-xl font-display text-white mb-3">Confirm Logout</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to end your session?</p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setLogoutPopup(false)} className="text-gray-300 hover:text-white">
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmLogout} className="bg-red-600 hover:bg-red-700">
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toast.type && (
        <div className="fixed bottom-4 right-4 z-50 animate-fade-in-up">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          } text-white`}>
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {toast.message}
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminPage;
