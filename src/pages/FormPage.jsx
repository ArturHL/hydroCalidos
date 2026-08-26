function FormPage() {
  function handleSubmit(event) {
    event.preventDefault()
  }

  return (
    <section>
      <h1>Formulario</h1>
      <form onSubmit={handleSubmit}>
        <button type="submit">Guardar</button>
      </form>
    </section>
  )
}

export default FormPage
