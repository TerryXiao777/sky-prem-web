import * as React from "react"
import { cn } from "cn"

function Form({ className, ...props }: React.ComponentProps<"form">) {
  return (
    <form
      data-slot="form"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  )
}

function FormField({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="form-field"
      className={cn("grid gap-2", className)}
      {...props}
    />
  )
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="form-message"
      className={cn("text-sm text-destructive font-medium", className)}
      {...props}
    />
  )
}

export { Form, FormField, FormMessage }
