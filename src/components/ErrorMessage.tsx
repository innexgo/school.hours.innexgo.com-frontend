function ErrorMessage(props: {error: Error}) {
  return <>
    <p className="text-danger">{props.error.name}: <code>{props.error.message}</code></p>
    <details>
      <summary className="mb-3">Stack Trace</summary>
      <div className="mx-3">
        <samp>{props.error.stack}</samp>
      </div>
    </details>
  </>
}

export default ErrorMessage;
