import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { updateOrgName } from '@/funcs/org'
import { OrgNameForm, OrgSlugForm } from '@/validations'

import type z from 'zod/v4'

type OrgNameFormValues = z.infer<typeof OrgNameForm>

export function EditOrgNameForm({ organizationId, defaultName }: { organizationId: string; defaultName: string }) {
  const form = useForm<OrgNameFormValues>({
    resolver: zodResolver(OrgNameForm),
    defaultValues: { name: defaultName, organizationId },
    mode: 'onTouched',
  })

  async function onSubmit(values: OrgNameFormValues) {
    await updateOrgName({ data: { organizationId: values.organizationId, name: values.name } })
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
                  placeholder="Org Name"
                  disabled={form.formState.isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Please use 32 characters at maximum.
          </p>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Save
          </Button>
        </div>
      </form>
    </Form>
  )
}


type OrgSlugFormValues = z.infer<typeof OrgSlugForm>

export function EditOrgSlugForm({ defaultName }: { defaultName: string }) {
  const form = useForm<OrgSlugFormValues>({
    resolver: zodResolver(OrgSlugForm),
    defaultValues: { slug: defaultName },
    mode: 'onTouched',
  })

  async function onSubmit(values: OrgSlugFormValues) {
    console.log('onSubmit', values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Org Slug"
                  disabled={form.formState.isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Please use 48 characters at maximum.
          </p>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Save
          </Button>
        </div>
      </form>
    </Form>
  )
}

