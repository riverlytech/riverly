import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import z from 'zod/v4'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { authClient } from '@/lib/auth-client'

const CreateOrgFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  slug: z
    .string()
    .min(3, { message: 'Slug must be at least 3 characters.' })
    .regex(/^[a-z0-9-]+$/, {
      message: 'Use lowercase letters, numbers, and dashes only.',
    }),
})

type CreateOrgFormValues = z.infer<typeof CreateOrgFormSchema>

export function CreateOrgSheetForm() {
  const form = useForm<CreateOrgFormValues>({
    resolver: zodResolver(CreateOrgFormSchema),
    defaultValues: {
      name: '',
      slug: '',
    },
    mode: 'onTouched',
  })

  function onSubmit(values: CreateOrgFormValues) {
    console.log(values)
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="default" className="font-semibold">
          Create Org
        </Button>
      </SheetTrigger>
      <SheetContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex h-full flex-col"
          >
            <SheetHeader>
              <SheetTitle>Create an Organization</SheetTitle>
              <SheetDescription>
                Unlock collaboration and team work.
              </SheetDescription>
            </SheetHeader>
            <div className="grid flex-1 auto-rows-min gap-6 px-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="grid gap-3">
                    <FormLabel htmlFor="sheet-org-name">Name</FormLabel>
                    <FormControl>
                      <Input
                        id="sheet-org-name"
                        placeholder="Acme Inc"
                        disabled={form.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem className="grid gap-3">
                    <FormLabel htmlFor="sheet-org-slug">Slug</FormLabel>
                    <FormControl>
                      <Input
                        id="sheet-org-slug"
                        placeholder="acme"
                        disabled={form.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <SheetFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Create Org
              </Button>
              <SheetClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={form.formState.isSubmitting}
                >
                  Cancel
                </Button>
              </SheetClose>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
