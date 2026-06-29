import { motion } from 'framer-motion';
import { Edit2, Trash2 } from 'lucide-react';
import { Badge } from '../ui';

/** CgpaChart — lists semester records, visual Tailwind progress bars, and editing/deleting control triggers */
export default function CgpaChart({ records, onEdit, onDelete }) {
  // Sort records by semester number ascending
  const sortedRecords = [...records].sort((a, b) => a.semester - b.semester);

  return (
    <div className="glass p-6 rounded-3xl border border-surface-800/60 flex flex-col gap-6">
      <h3 className="text-sm font-bold text-surface-200 uppercase tracking-wider">
        Semester Breakdown & Performance
      </h3>

      <div className="flex flex-col gap-5 divide-y divide-surface-800/40">
        {sortedRecords.map((record) => {
          const sgpa = parseFloat(record.sgpa);
          const percent = (sgpa / 10) * 100;
          
          let barColor = 'from-red-600 to-red-400';
          let badgeColor = 'red';
          if (sgpa >= 8) {
            barColor = 'from-green-600 to-green-400 shadow-green';
            badgeColor = 'green';
          } else if (sgpa >= 6) {
            barColor = 'from-yellow-650 to-yellow-400 shadow-yellow';
            badgeColor = 'yellow';
          }

          return (
            <div key={record.id} className="flex flex-col gap-2.5 pt-4 first:pt-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-extrabold text-surface-100">
                    Semester {record.semester}
                  </span>
                  <Badge text={`${sgpa.toFixed(2)} SGPA`} color={badgeColor} size="sm" />
                </div>

                {/* Edit & Delete buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(record)}
                    className="text-surface-550 hover:text-surface-200 transition-colors p-1.5 rounded-lg hover:bg-surface-850"
                    title="Edit Semester SGPA"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(record.id)}
                    className="text-surface-550 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10"
                    title="Delete Semester Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-3 w-full bg-surface-950 rounded-full overflow-hidden border border-surface-800/50 relative">
                <motion.div
                  className={`h-full bg-gradient-to-r ${barColor} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.65, ease: 'easeOut' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
