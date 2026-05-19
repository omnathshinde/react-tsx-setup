import { Button, MenuItem, TextField } from "@mui/material";

export interface TodoFormState {
	title: string;
	description: string;
	status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
	reminderAt: string;
	file: File | null;
}

interface TodoFormProps {
	form: TodoFormState;
	isEditing: boolean;
	onChange: (field: keyof TodoFormState, value: string | File | null) => void;

	onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export default function TodoForm({ form, isEditing, onChange, onSubmit }: TodoFormProps) {
	return (
		<form onSubmit={onSubmit} className="mt-4 space-y-5">
			<TextField
				label="Title"
				fullWidth
				required
				value={form.title}
				onChange={(event) => onChange("title", event.target.value)}
			/>

			<TextField
				label="Description"
				fullWidth
				required
				rows={4}
				multiline
				value={form.description}
				onChange={(event) => onChange("description", event.target.value)}
			/>

			<TextField
				select
				label="Status"
				fullWidth
				value={form.status}
				onChange={(event) => onChange("status", event.target.value)}
			>
				<MenuItem value="PENDING">Pending</MenuItem>

				<MenuItem value="IN_PROGRESS">In Progress</MenuItem>

				<MenuItem value="COMPLETED">Completed</MenuItem>
			</TextField>

			<TextField
				type="datetime-local"
				label="Reminder"
				fullWidth
				value={form.reminderAt}
				onChange={(event) => onChange("reminderAt", event.target.value)}
			/>

			<div>
				<label className="mb-2 block text-sm font-medium text-slate-700">
					File Upload (Optional)
				</label>

				<input
					type="file"
					onChange={(event) => onChange("file", event.target.files?.[0] || null)}
					className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
				/>
			</div>

			<Button type="submit" fullWidth variant="contained" size="large">
				{isEditing ? "Update Todo" : "Create Todo"}
			</Button>
		</form>
	);
}
