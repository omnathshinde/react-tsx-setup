import { Button, MenuItem, TextField } from "@mui/material";
import { memo, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

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
	onSubmit: (data: TodoFormState) => Promise<void>;
}

function TodoForm({ form, isEditing, onSubmit }: TodoFormProps) {
	const {
		register,
		control,
		handleSubmit,
		reset,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<TodoFormState>({
		defaultValues: form,
		mode: "onChange",
	});

	useEffect(() => {
		reset(form);
	}, [form, reset]);

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-5">
			<TextField
				label="Title"
				fullWidth
				{...register("title", {
					required: "Title is required",
					minLength: {
						value: 3,
						message: "Minimum 3 characters",
					},
				})}
				error={!!errors.title}
				helperText={errors.title?.message}
			/>

			<TextField
				label="Description"
				fullWidth
				rows={4}
				multiline
				{...register("description", {
					required: "Description is required",
					minLength: {
						value: 10,
						message: "Minimum 10 characters",
					},
				})}
				error={!!errors.description}
				helperText={errors.description?.message}
			/>

			<Controller
				name="status"
				control={control}
				render={({ field }) => (
					<TextField select label="Status" fullWidth {...field}>
						<MenuItem value="PENDING">Pending</MenuItem>
						<MenuItem value="IN_PROGRESS">In Progress</MenuItem>
						<MenuItem value="COMPLETED">Completed</MenuItem>
					</TextField>
				)}
			/>

			<TextField
				type="datetime-local"
				label="Reminder"
				fullWidth
				{...register("reminderAt", {
					validate: (value) =>
						!value || new Date(value) > new Date() || "Reminder must be future date",
				})}
				error={!!errors.reminderAt}
				helperText={errors.reminderAt?.message}
			/>

			<div>
				<label className="mb-2 block text-sm font-medium text-slate-700">
					File Upload (Optional)
				</label>
				<input
					type="file"
					onChange={(e) =>
						setValue("file", e.target.files?.[0] || null, { shouldValidate: true })
					}
					className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
				/>
			</div>

			<Button
				type="submit"
				fullWidth
				variant="contained"
				size="large"
				disabled={isSubmitting}
			>
				{isEditing ? "Update Todo" : "Create Todo"}
			</Button>
		</form>
	);
}

export default memo(TodoForm);
