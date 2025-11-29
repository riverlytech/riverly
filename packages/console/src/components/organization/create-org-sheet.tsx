import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from '@tanstack/react-router'
import { useDebounce } from '@uidotdev/usehooks'
import { useCallback, useEffect, useRef, useState } from 'react'
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
import { createNewOrg } from '@/funcs/org'
import { authClient } from '@/lib/auth-client'
import { CreateOrgForm } from '@/validations'

type CreateOrgFormValues = z.infer<typeof CreateOrgForm>

export function CreateOrgSheetForm() {
  const form = useForm<CreateOrgFormValues>({
    resolver: zodResolver(CreateOrgForm),
    defaultValues: {
      name: '',
      slug: '',
    },
    mode: 'onTouched',
  })

  const [open, setOpen] = useState(false)
  const [isCheckingSlug, setIsCheckingSlug] = useState(false)
  const slugCheckIdRef = useRef(0)
  const slugValue = form.watch('slug')
  const debouncedSlug = useDebounce(slugValue, 500)
  const router = useRouter()

  const checkSlugAvailability = useCallback(
    async (slug: string) => {
      const isValidSlug = CreateOrgForm.shape.slug.safeParse(slug)
      if (!isValidSlug.success) {
        return null
      }
      const checkId = ++slugCheckIdRef.current
      setIsCheckingSlug(true)
      try {
        const { error } = await authClient.organization.checkSlug({ slug })
        if (
          slugCheckIdRef.current !== checkId ||
          form.getValues('slug') !== slug
        ) {
          return null
        }
        if (error) {
          form.setError('slug', {
            type: 'slug-taken',
            message: error.message ?? 'Slug is already taken.',
          })
          return false
        }
        form.clearErrors('slug')
        return true
      } catch (err) {
        if (
          slugCheckIdRef.current !== checkId ||
          form.getValues('slug') !== slug
        ) {
          return null
        }
        form.setError('slug', {
          type: 'slug-check',
          message:
            err instanceof Error
              ? err.message
              : 'Unable to verify slug availability. Try again.',
        })
        return false
      } finally {
        if (slugCheckIdRef.current === checkId) {
          setIsCheckingSlug(false)
        }
      }
    },
    [form],
  )

  useEffect(() => {
    const fieldError = form.getFieldState('slug').error
    if (
      fieldError?.type === 'slug-taken' ||
      fieldError?.type === 'slug-check'
    ) {
      form.clearErrors('slug')
    }
  }, [slugValue, form])

  useEffect(() => {
    if (!debouncedSlug) {
      return
    }
    void checkSlugAvailability(debouncedSlug)
  }, [debouncedSlug, checkSlugAvailability])

  async function onSubmit(values: CreateOrgFormValues) {
    const slugAvailable = await checkSlugAvailability(values.slug)
    if (slugAvailable === false) {
      return
    }
    await createNewOrg({
      data: {
        name: values.name,
        slug: values.slug,
      },
    })
    await router.invalidate({
      filter: (match) => match.fullPath === '/',
    })
    form.reset()
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
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
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || isCheckingSlug}
              >
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
