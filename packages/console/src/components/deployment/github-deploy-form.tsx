import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Plus, Trash2, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'

import { DeploymentTarget } from '@riverly/ty'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { githubDeployServerFn } from '@/funcs/deploy'
import { GitHubDeployForm } from '@/validations'

import type z from 'zod/v4'

type GitHubDeployFormValues = z.infer<typeof GitHubDeployForm>

export function GitHubDeployFormComponent({
  slug,
  serverId,
  repo,
}: {
  slug: string
  serverId: string
  repo: string
}) {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    resolver: zodResolver(GitHubDeployForm),
    defaultValues: {
      serverId,
      repo,
      rootDir: './',
      envs: [],
      target: DeploymentTarget.PREVIEW,
    },
    mode: 'onTouched',
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'envs',
  })

  async function onSubmit(values: GitHubDeployFormValues) {
    try {
      setError(null)
      const response = await githubDeployServerFn({ data: values })

      if (response.success && response.result) {
        const deploymentId = response.result.deploymentId
        if (deploymentId) {
          await navigate({
            to: '/$slug/deployments/$deploymentId',
            params: {
              slug,
              deploymentId,
            },
          })
        } else {
          await navigate({
            to: '/$slug/deployments',
            params: { slug },
          })
        }
      } else {
        setError(response.errors?.[0]?.message || 'Deployment failed')
      }
    } catch (err) {
      console.error('Deployment error:', err)
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred',
      )
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <FormField
          control={form.control}
          name="serverId"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="hidden" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="repo"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="hidden" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rootDir"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">
                Root Directory
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="./"
                  disabled={form.formState.isSubmitting}
                  className="font-mono"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The root directory of your Dockerfile. Use{' '}
                <span className="font-mono">./</span> for the repository root.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="target"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">
                Deployment Target
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={form.formState.isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select deployment target" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={DeploymentTarget.PREVIEW}>
                    Preview
                  </SelectItem>
                  <SelectItem value={DeploymentTarget.PRODUCTION}>
                    Production
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Preview deployments are for testing. Production deployments are
                live.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">
            Environment Variables
          </FormLabel>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex gap-2 items-start p-3 border rounded-lg bg-muted/30"
              >
                <div className="flex-1 space-y-3">
                  <FormField
                    control={form.control}
                    name={`envs.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="VARIABLE_NAME"
                            disabled={form.formState.isSubmitting}
                            className="font-mono"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`envs.${index}.value`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="value"
                            disabled={form.formState.isSubmitting}
                            className="font-mono"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`envs.${index}.secret`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center gap-2 space-y-0">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={form.formState.isSubmitting}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          Mark as secret
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => remove(index)}
                  disabled={form.formState.isSubmitting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => append({ name: '', value: '', secret: false })}
              disabled={form.formState.isSubmitting}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Environment Variable
            </Button>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full text-base font-semibold font-mono"
          disabled={form.formState.isSubmitting}
        >
          Deploy
        </Button>
      </form>
    </Form>
  )
}
