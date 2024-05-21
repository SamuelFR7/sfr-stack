interface FormMessageProps {
  errors: string[] | undefined
}

export function FormMessage({ errors }: FormMessageProps) {
  return errors ? (
    <p className="text-sm font-medium text-destructive">{errors[0]}</p>
  ) : (
    <></>
  )
}
