import { Tag } from "@advanced-react/server/database/schema";
import {
  ExperienceFilterParams,
  experienceFiltersSchema,
} from "@advanced-react/shared/schema/experience";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/features/shared/components/ui/Button";
import Card from "@/features/shared/components/ui/Card";
import { DateTimePicker } from "@/features/shared/components/ui/DateTimePicker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/features/shared/components/ui/Form";
import Input from "@/features/shared/components/ui/Input";
import { MultiSelect } from "@/features/shared/components/ui/MultiSelect";

type ExperienceFiltersProps = {
  onFiltersChange: (filters: ExperienceFilterParams) => void;
  initialFilters?: ExperienceFilterParams;
  tags: Tag[];
};

export function ExperienceFilters({
  onFiltersChange,
  initialFilters,
  tags,
}: ExperienceFiltersProps) {
  const form = useForm<ExperienceFilterParams>({
    resolver: zodResolver(experienceFiltersSchema),
    defaultValues: initialFilters,
  });

  const handleSubmit = form.handleSubmit((values) => {
    const filters: ExperienceFilterParams = {};

    if (values.q?.trim()) {
      filters.q = values.q.trim();
    }

    if (values.tags) {
      filters.tags = values.tags;
    }

    if (values.scheduledAt) {
      filters.scheduledAt = values.scheduledAt;
    }

    onFiltersChange(filters);
  });

  return (
    <Form {...form}>
      <Card>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-row gap-4">
            <FormField
              control={form.control}
              name="q"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      {...field}
                      type="search"
                      value={field.value ?? ""}
                      placeholder="Search experiences..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduledAt"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <DateTimePicker {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <MultiSelect
                options={tags.map((tag) => ({
                  value: tag.id.toString(),
                  label: tag.name,
                }))}
                onValueChange={(tags) => {
                  field.onChange(tags.map(Number));
                }}
                defaultValue={field.value?.map((tag) => tag.toString())}
                placeholder="Select tags..."
              />
            )}
          />
          <Button type="submit" disabled={form.formState.isSubmitting}>
            <Search className="h-4 w-4" />
            Search
          </Button>
        </form>
      </Card>
    </Form>
  );
}
