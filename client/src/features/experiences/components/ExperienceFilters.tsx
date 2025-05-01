import {
  ExperienceFilterParams,
  experienceFiltersSchema,
} from "@advanced-react/shared/schema/experience";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/features/shared/components/ui/Button";
import Card from "@/features/shared/components/ui/Card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/features/shared/components/ui/Form";
import Input from "@/features/shared/components/ui/Input";

type ExperienceFiltersProps = {
  onFiltersChange: (filters: ExperienceFilterParams) => void;
  initialFilters?: ExperienceFilterParams;
};

export function ExperienceFilters({
  onFiltersChange,
  initialFilters,
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

    onFiltersChange(filters);
  });

  return (
    <Form {...form}>
      <Card>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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

          <Button type="submit" disabled={form.formState.isSubmitting}>
            <Search className="h-4 w-4" />
            Search
          </Button>
        </form>
      </Card>
    </Form>
  );
}
