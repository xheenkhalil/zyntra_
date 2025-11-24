# How to Add Instructions Field to ExamBuilderPage.tsx

The `ExamBuilderPage.tsx` file keeps getting corrupted during automated edits. Here's a manual guide to add the instructions field:

## Changes Needed:

### 1. Update Exam Interface (around line 20)
```typescript
// Change from:
interface Exam { id: string; title: string; status: 'draft' | 'live' | 'completed';  questions: Question[]; grading_scale?: Record<string, number>; duration_minutes?: number; }

// To:
interface Exam { id: string; title: string; status: 'draft' | 'live' | 'completed'; questions: Question[]; grading_scale?: Record<string, number>; duration_minutes?: number; instructions?: string; }
```

### 2. Add instructions state (around line 236)
```typescript
// Add after duration state:
const [instructions, setInstructions] = useState('');
```

### 3. Load instructions from exam data (around line 249, in fetchExam function)
```typescript
// Add after duration loading:
if (data.instructions) {
    setInstructions(data.instructions);
}
```

### 4. Add instructions TextField in Settings section (around line 309, after the duration TextField)
```typescript
<TextField
    label="Exam Instructions (Markdown Supported)"
    multiline
    rows={4}
    fullWidth
    value={instructions}
    onChange={e => setInstructions(e.target.value)}
    placeholder="# Heading\n**bold text**\n*italic text*"
    helperText="Use markdown formatting for better presentation"
    sx={{ mb: 3 }}
/>
```

###5. Update handlePublish to save instructions (around line 277)
```typescript
// Change from:
await updateExamSettings(exam.id, {
    status: 'live',
    grading_scale: numericGradingScale,
    duration_minutes: Number(duration)
});

// To:
await updateExamSettings(exam.id, {
    status: 'live',
    grading_scale: numericGradingScale,
    duration_minutes: Number(duration),
    instructions: instructions
});
```

## Summary
These changes allow course admins to:
- Write exam instructions with markdown formatting
- Students will see these instructions in the ExamInstructionsDialog before starting the exam
- The backend is already configured to handle the instructions field
