import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { LogOut, Database, Eye, EyeOff, Save, X, Trash2, Plus, Edit2, Upload } from 'lucide-react';
import { Session } from '@supabase/supabase-js';

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

  const navigate = useNavigate();

  // Check session on mount
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
      console.error(error);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError(error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
    } catch (error) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleInsert = async () => {
    if (!newRow) return;
    const { data, error } = await supabase.from(activeTable).insert(newRow).select();
    if (error) {
      alert('Insert failed: ' + error.message);
      return;
    }
    setNewRow(null);
    fetchTableData(activeTable);
    logAction('INSERT', activeTable, data?.[0]?.id, newRow);
  };

  const handleUpdate = async () => {
    if (!editingRow || !editingRow.id) return;
    const { error } = await supabase.from(activeTable).update(editingRow).eq('id', editingRow.id);
    if (error) {
      alert('Update failed: ' + error.message);
      return;
    }
    setEditingRow(null);
    fetchTableData(activeTable);
    logAction('UPDATE', activeTable, editingRow.id, editingRow);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    const { error } = await supabase.from(activeTable).delete().eq('id', id);
    if (error) {
      alert('Delete failed: ' + error.message);
      return;
    }
    fetchTableData(activeTable);
    logAction('DELETE', activeTable, id);
  };

  const toggleBoolean = async (row: any, column: string) => {
    const newValue = !row[column];
    const { error } = await supabase.from(activeTable).update({ [column]: newValue }).eq('id', row.id);
    if (error) {
      alert('Update failed: ' + error.message);
      return;
    }
    fetchTableData(activeTable);
    logAction('UPDATE', activeTable, row.id, { [column]: newValue });
  };

  if (loading) {
    return <div className="min-h-screen bg-secondary flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
        <div className="bg-card max-w-md w-full p-8 rounded-lg shadow-xl">
          <h2 className="font-display text-2xl text-center mb-6">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded border border-border bg-background text-foreground"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded border border-border bg-background text-foreground"
            />
            <Button type="submit" variant="hero" className="w-full">Login</Button>
            {loginError && <p className="text-destructive text-sm text-center">{loginError}</p>}
          </form>
        </div>
      </div>
    );
  }

  const isImageColumn = (colName: string) => colName === 'cover_image';

  return (
    <div className="min-h-screen bg-secondary text-secondary-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-display text-2xl text-accent">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{session.user.email}</span>
            <Button variant="ghost" size="sm" onClick={() => setShowLogs(!showLogs)}>
              <Database size={16} className="mr-2" />
              {showLogs ? 'Hide Logs' : 'Show Logs'}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Table Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['books', 'news_posts', 'upcoming_books', 'reviews', 'contact_messages', 'admin_logs'] as TableName[]).map(table => (
            <button
              key={table}
              onClick={() => setActiveTable(table)}
              className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
                activeTable === table
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-card hover:bg-accent/20'
              }`}
            >
              {table.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Logs Panel */}
        {showLogs && (
          <div className="bg-card p-4 rounded-lg mb-6 max-h-80 overflow-auto">
            <h3 className="font-display text-lg mb-3">Recent Activity</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2">Time</th>
                  <th className="text-left">Action</th>
                  <th className="text-left">Table</th>
                  <th className="text-left">Record ID</th>
                  <th className="text-left">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-b border-border/50">
                    <td className="py-2">{new Date(log.created_at).toLocaleString()}</td>
                    <td>{log.action}</td>
                    <td>{log.table_name}</td>
                    <td>{log.record_id || '-'}</td>
                    <td className="max-w-xs truncate">{JSON.stringify(log.details)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-card rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                {tableColumns.map(col => (
                  <th key={col.name} className="px-4 py-3 text-left font-semibold capitalize">
                    {col.name.replace('_', ' ')}
                  </th>
                ))}
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* New row input */}
              {newRow && (
                <tr className="bg-accent/10">
                  {tableColumns.map(col => (
                    <td key={col.name} className="px-4 py-2">
                      {col.name === 'id' ? (
                        <span className="text-muted-foreground">auto</span>
                      ) : isImageColumn(col.name) ? (
                        <div className="flex flex-col gap-2">
                          {newRow.cover_image && (
                            <img src={newRow.cover_image} alt="Cover" className="h-12 w-auto object-cover rounded" />
                          )}
                          <div className="flex gap-2 items-center">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) await handleFileUpload(file, newRow, true);
                              }}
                              className="text-sm"
                            />
                            {uploading && <span className="text-xs">Uploading...</span>}
                          </div>
                        </div>
                      ) : col.type.includes('bool') ? (
                        <input
                          type="checkbox"
                          checked={newRow[col.name] || false}
                          onChange={e => setNewRow({ ...newRow, [col.name]: e.target.checked })}
                        />
                      ) : (
                        <input
                          type="text"
                          value={newRow[col.name] || ''}
                          onChange={e => setNewRow({ ...newRow, [col.name]: e.target.value })}
                          className="w-full px-2 py-1 rounded border border-border bg-background text-foreground"
                        />
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-2">
                    <button onClick={handleInsert} className="text-green-600 hover:text-green-400 mr-2" disabled={uploading}><Save size={16} /></button>
                    <button onClick={() => setNewRow(null)} className="text-destructive hover:text-destructive/80"><X size={16} /></button>
                  </td>
                </tr>
              )}

              {/* Existing rows */}
              {tableData.map(row => (
                <tr key={row.id} className="border-t border-border hover:bg-muted/50">
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
                                <img src={editingRow.cover_image} alt="Cover" className="h-12 w-auto object-cover rounded" />
                              )}
                              <div className="flex gap-2 items-center">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) await handleFileUpload(file, row, false);
                                  }}
                                  className="text-sm"
                                />
                                {uploading && <span className="text-xs">Uploading...</span>}
                              </div>
                            </div>
                          ) : col.type.includes('bool') ? (
                            <input
                              type="checkbox"
                              checked={editingRow[col.name] || false}
                              onChange={e => setEditingRow({ ...editingRow, [col.name]: e.target.checked })}
                            />
                          ) : (
                            <input
                              type="text"
                              value={editingRow[col.name] || ''}
                              onChange={e => setEditingRow({ ...editingRow, [col.name]: e.target.value })}
                              className="w-full px-2 py-1 rounded border border-border bg-background text-foreground"
                            />
                          )
                        ) : (
                          <span className={col.type.includes('bool') ? (value ? 'text-green-500' : 'text-red-500') : ''}>
                            {isImageColumn(col.name) && value ? (
                              <img src={value} alt="Cover" className="h-12 w-auto object-cover rounded" />
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
                        <button onClick={handleUpdate} className="text-green-600 hover:text-green-400 mr-2" disabled={uploading}><Save size={16} /></button>
                        <button onClick={() => setEditingRow(null)} className="text-destructive hover:text-destructive/80"><X size={16} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditingRow(row)} className="text-accent hover:text-accent/80 mr-2"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(row.id)} className="text-destructive hover:text-destructive/80"><Trash2 size={16} /></button>
                        {activeTable === 'reviews' && (
                          <button
                            onClick={() => toggleBoolean(row, 'approved')}
                            className="ml-2 text-blue-500 hover:text-blue-400"
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

        {/* Add new row button */}
        <div className="mt-4">
          <Button variant="hero" size="sm" onClick={() => setNewRow({})}>
            <Plus size={16} className="mr-2" />
            Add New Record
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
