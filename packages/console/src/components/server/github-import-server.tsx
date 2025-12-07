import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { CircleAlert } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { ServerVisibilityEnum } from '@riverly/ty'

import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { importServerFromGitHub } from '@/funcs'
import { ImportServerFromGitHubForm } from '@/validations'

import type z from 'zod/v4'

type GitHubImportFormValues = z.infer<typeof ImportServerFromGitHubForm>

export function GitHubImportServerForm({
  slug,
  organizationId,
  repoFullName,
  isPrivate,
}: {
  slug: string
  organizationId: string
  repoFullName: string // sanchitrk/mcping
  isPrivate: boolean
}) {
  const navigate = useNavigate()
  const visibility = isPrivate
    ? ServerVisibilityEnum.PRIVATE
    : ServerVisibilityEnum.PUBLIC
  const form = useForm<GitHubImportFormValues>({
    resolver: zodResolver(ImportServerFromGitHubForm),
    defaultValues: {
      title: '',
      description: '',
      organizationId: organizationId,
      visibility: visibility,
      repoUrl: repoFullName,
    },
    mode: 'onTouched',
  })

  async function onSubmit(values: GitHubImportFormValues) {
    const request = {
      organizationId: values.organizationId,
      title: values.title,
      description: values.description,
      visibility: values.visibility,
      repoUrl: values.repoUrl,
    }
    const response = await importServerFromGitHub({ data: request })
    navigate({
      to: '/$slug/servers/$serverId',
      params: {
        slug,
        serverId: response.serverId,
      },
    }).then()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="shadow-none">
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="organizationId"
              render={({ field }) => (
                <Input
                  className="hidden"
                  disabled={form.formState.isSubmitting}
                  {...field}
                />
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Acme MCP Server"
                      disabled={form.formState.isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A short, descriptive title for your server.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      className="bg-background"
                      placeholder="A brief description of your server."
                      disabled={form.formState.isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Visibility</CardTitle>
            <CardDescription>Choose who can see this server.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={form.formState.isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={ServerVisibilityEnum.PRIVATE}>
                        Private
                      </SelectItem>
                      <SelectItem value={ServerVisibilityEnum.PUBLIC}>
                        Public
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {field.value === ServerVisibilityEnum.PUBLIC
                      ? 'Anyone on the internet can see this server.'
                      : 'Only you can see this server.'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>
            The CLI is required to link and deploy MCP servers.
          </AlertTitle>
        </Alert>
        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Import Server
          </Button>
        </div>
      </form>
    </Form>
  )
}
