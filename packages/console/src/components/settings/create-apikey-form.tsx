import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { orgCreateAPIKey } from '@/funcs/org'
import { CreateAPIKeyForm } from '@/validations'

type NameFormValues = z.infer<typeof CreateAPIKeyForm>

export function APIKeyForm({
  organizationId,
  onSuccess,
}: {
  organizationId: string
  onSuccess?: () => void | Promise<void>
}) {
  const form = useForm<NameFormValues>({
    resolver: zodResolver(CreateAPIKeyForm),
    defaultValues: { name: '' },
    mode: 'onTouched',
  })

  async function onSubmit(values: NameFormValues) {
    await orgCreateAPIKey({ data: { name: values.name, organizationId } })
    await onSuccess?.()
    form.reset()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Acme's Test Key"
                  disabled={form.formState.isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between items-center">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Create Key
          </Button>
        </div>
      </form>
    </Form>
  )
}
