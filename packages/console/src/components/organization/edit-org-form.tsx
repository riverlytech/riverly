import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from '@tanstack/react-router'
import { useDebounce } from '@uidotdev/usehooks'
import { useCallback, useEffect, useRef, useState } from 'react'
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
import { updateOrgName, updateOrgSlug } from '@/funcs/org'
import { authClient } from '@/lib/auth-client'
import { OrgNameForm, OrgSlugForm } from '@/validations'

import type z from 'zod/v4'

type OrgNameFormValues = z.infer<typeof OrgNameForm>

export function EditOrgNameForm({
  organizationId,
  defaultName,
}: {
  organizationId: string
  defaultName: string
}) {
  const form = useForm<OrgNameFormValues>({
    resolver: zodResolver(OrgNameForm),
    defaultValues: { name: defaultName, organizationId },
    mode: 'onTouched',
  })

  async function onSubmit(values: OrgNameFormValues) {
    await updateOrgName({
      data: { organizationId: values.organizationId, name: values.name },
    })
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
        <FormField
          control={form.control}
          name="organizationId"
          render={({ field }) => (
            <FormItem>
              <Input
                className="hidden"
                disabled={form.formState.isSubmitting}
                {...field}
              />
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

export function EditOrgSlugForm({
  organizationId,
  defaultName,
}: {
  organizationId: string
  defaultName: string
}) {
  const router = useRouter()
  const form = useForm<OrgSlugFormValues>({
    resolver: zodResolver(OrgSlugForm),
    defaultValues: { organizationId: organizationId, slug: defaultName },
    mode: 'onTouched',
  })
  const [isCheckingSlug, setIsCheckingSlug] = useState(false)
  const slugCheckIdRef = useRef(0)
  const slugValue = form.watch('slug')
  const debouncedSlug = useDebounce(slugValue, 500)

  const checkSlugAvailability = useCallback(
    async (slug: string) => {
      const isValidSlug = OrgSlugForm.shape.slug.safeParse(slug)
      if (!isValidSlug.success) {
        return null
      }
      if (slug === defaultName) {
        form.clearErrors('slug')
        return true
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
    [defaultName, form],
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

  async function onSubmit(values: OrgSlugFormValues) {
    const slugAvailability = await checkSlugAvailability(values.slug)
    if (slugAvailability === false) {
      return
    }
    await updateOrgSlug({
      data: { organizationId: values.organizationId, slug: values.slug },
    })
    await router.navigate({
      to: '/$slug/settings',
      params: { slug: values.slug },
      reloadDocument: true,
      replace: true,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="organizationId"
          render={({ field }) => (
            <FormItem>
              <Input
                className="hidden"
                disabled={form.formState.isSubmitting}
                {...field}
              />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Org Slug"
                  disabled={form.formState.isSubmitting || isCheckingSlug}
                  {...field}
                />
              </FormControl>
              <FormMessage />
              {isCheckingSlug && !form.formState.errors.slug && (
                <p className="text-sm text-muted-foreground">
                  Checking slug availability...
                </p>
              )}
            </FormItem>
          )}
        />
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Please use 48 characters at maximum.
          </p>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting || isCheckingSlug}
          >
            Save
          </Button>
        </div>
      </form>
    </Form>
  )
}
