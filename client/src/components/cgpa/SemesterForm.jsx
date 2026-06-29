import { useEffect, useState } from 'react';
import { Button, Input } from '../ui';

/** SemesterForm — handles add/edit semester records with strict validations for 1-8 and 0-10 SGPA */
export default function SemesterForm({ onSubmit, editingRecord, onCancel, loading = false }) {
  const [semester, setSemester] = useState('');
  const [sgpa, setSgpa] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingRecord) {
      setSemester(editingRecord.semester.toString());
      setSgpa(editingRecord.sgpa.toString());
    } else {
      setSemester('');
      setSgpa('');
    }
    setErrors({});
  }, [editingRecord]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    const semNum = parseInt(semester, 10);
    if (isNaN(semNum) || semNum < 1 || semNum > 8) {
      newErrors.semester = 'Semester must be between 1 and 8';
    }

    const sgpaVal = parseFloat(sgpa);
    if (isNaN(sgpaVal) || sgpaVal < 0 || sgpaVal > 10) {
      newErrors.sgpa = 'SGPA must be between 0.00 and 10.00';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      semester: semNum,
      sgpa: sgpaVal
    });
  };

  return (
    <div className="glass p-6 rounded-3xl border border-surface-800/60 flex flex-col gap-5">
      <h3 className="text-sm font-bold text-surface-200 uppercase tracking-wider">
        {editingRecord ? `Edit Semester ${editingRecord.semester}` : 'Add Semester Record'}
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Semester number */}
        <Input
          label="Semester Number (1-8)"
          type="number"
          placeholder="e.g. 1"
          min="1"
          max="8"
          value={semester}
          onChange={(e) => {
            setSemester(e.target.value);
            if (errors.semester) setErrors(prev => ({ ...prev, semester: null }));
          }}
          disabled={!!editingRecord || loading} // semester can't be changed during edit to avoid primary key conflicts, user deletes and re-adds if wrong
          required
          error={errors.semester}
          className="bg-surface-950"
        />

        {/* SGPA value */}
        <Input
          label="SGPA (0.00 - 10.00)"
          type="number"
          step="0.01"
          placeholder="e.g. 8.54"
          min="0"
          max="10"
          value={sgpa}
          onChange={(e) => {
            setSgpa(e.target.value);
            if (errors.sgpa) setErrors(prev => ({ ...prev, sgpa: null }));
          }}
          disabled={loading}
          required
          error={errors.sgpa}
          className="bg-surface-950"
        />

        {/* Action Buttons */}
        <div className="flex gap-3 mt-2">
          {editingRecord && (
            <Button
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="flex-1 rounded-xl"
          >
            {editingRecord ? 'Update' : 'Add Semester'}
          </Button>
        </div>
      </form>
    </div>
  );
}
