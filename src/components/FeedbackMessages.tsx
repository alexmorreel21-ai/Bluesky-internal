type FeedbackMessagesProps = {
  className: string
  errorMessage: string
  successMessage: string
}

function FeedbackMessages({ className, errorMessage, successMessage }: FeedbackMessagesProps) {
  return (
    <div className={className} aria-live="polite">
      {errorMessage && <p className="form-message is-error">{errorMessage}</p>}
      {successMessage && <p className="form-message is-success">{successMessage}</p>}
    </div>
  )
}

export default FeedbackMessages