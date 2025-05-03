import { Experience } from "@advanced-react/server/database/schema";
import { experienceValidationSchema } from "@advanced-react/shared/schema/experience";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { LocationPicker } from "@/features/shared/components/LocationPicker";
import { Button } from "@/features/shared/components/ui/Button";
import { DateTimePicker } from "@/features/shared/components/ui/DateTimePicker";
import FileInput from "@/features/shared/components/ui/FileInput";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/features/shared/components/ui/Form";
import Input from "@/features/shared/components/ui/Input";
import { TextArea } from "@/features/shared/components/ui/TextArea";

import { useExperienceMutations } from "../hooks/useExperienceMutations";

type ExperienceFormData = z.infer<typeof experienceValidationSchema>;

type ExperienceFormProps = {
  experience?: Experience;
  onSuccess?: (id: Experience["id"]) => void;
  onCancel?: (id?: Experience["id"]) => void;
};

export function ExperienceForm({
  experience,
  onSuccess,
  onCancel,
}: ExperienceFormProps) {
  const form = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceValidationSchema),
    defaultValues: {
      id: experience?.id ?? undefined,
      title: experience?.title ?? "",
      content: experience?.content ?? "",
      url: experience?.url ?? null,
      scheduledAt: experience?.scheduledAt ?? "",
      location: experience?.location
        ? JSON.parse(experience.location)
        : undefined,
    },
  });

  const { addMutation, editMutation } = useExperienceMutations({
    add: {
      onSuccess,
    },
    edit: {
      onSuccess,
    },
  });

  const mutation = experience ? editMutation : addMutation;

  const handleSubmit = form.handleSubmit((data) => {
    const formData = new FormData();

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        if (key === "location") {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value as string | Blob);
        }
      }
    }

    mutation.mutate(formData);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <TextArea {...field} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scheduledAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Date</FormLabel>
              <FormControl>
                <DateTimePicker {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <FileInput
                  accept="image/*"
                  onChange={(event) => {
                    field.onChange(event.target?.files?.[0]);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <LocationPicker {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onCancel?.(experience?.id)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
