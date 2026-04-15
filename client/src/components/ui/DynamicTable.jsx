import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

/**
 * Reusable dynamic table for adding/removing rows of data.
 * @param {string[]} columns - Labels for the table columns.
 * @param {Array} rows - Current data rows.
 * @param {Function} onChange - Callback for data updates.
 * @param {Object} schema - Default object for a new row.
 */
const DynamicTable = ({ columns, rows, onChange, schema }) => {
  const addRow = () => {
    onChange([...rows, { ...schema }]);
  };

  const removeRow = (index) => {
    const updated = rows.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateRow = (index, field, value) => {
    const updated = rows.map((row, i) => 
      i === index ? { ...row, [field]: value } : row
    );
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-white/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-text-muted text-xs uppercase tracking-widest font-semibold">
              {columns.map((col, i) => (
                <th key={i} className="px-4 py-3 border-b border-white/5">{col}</th>
              ))}
              <th className="px-4 py-3 border-b border-white/5 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-text-muted italic">
                  No items added yet. Click "Add Row" to begin.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={index} className="hover:bg-white/2">
                  {Object.keys(schema).map((field, i) => (
                    <td key={i} className="px-3 py-2">
                      <input
                        type={typeof schema[field] === 'number' ? 'number' : 'text'}
                        value={row[field]}
                        onChange={(e) => updateRow(index, field, e.target.value)}
                        className="w-full bg-white/5 border border-transparent hover:border-white/10 focus:border-primary/50 rounded-lg px-3 py-1.5 transition-all text-sm outline-none"
                      />
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => removeRow(index)}
                      className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <button
        onClick={addRow}
        className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition-colors px-4 py-2 rounded-lg bg-primary/5 hover:bg-primary/10"
      >
        <Plus size={16} />
        Add Row
      </button>
    </div>
  );
};

export default DynamicTable;
