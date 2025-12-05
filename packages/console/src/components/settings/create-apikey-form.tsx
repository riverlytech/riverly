import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { orgCreateAPIKey } from '@/funcs/org'
import { CreateAPIKeyForm } from '@/validations'
import z from 'zod'

type NameFormValues = z.infer<typeof CreateAPIKeyForm>

export function APIKeyForm({ organizationId }: { organizationId: string }) {
  const form = useForm<NameFormValues>({
    resolver: zodResolver(CreateAPIKeyForm),
    defaultValues: { name: "" },
    mode: 'onTouched',
  })

  async function onSubmit(values: NameFormValues) {
    await orgCreateAPIKey({ data: { name: values.name, organizationId } })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Acme's Test Key"
                  disabled={form.formState.isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Choose a unique name that helps you identify this key.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Name must not be longer than 32 characters.
          </p>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Save
          </Button>
        </div>
      </form>
    </Form>
  )
}
