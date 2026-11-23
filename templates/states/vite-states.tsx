export const showStates = import.meta.env.DEV && window.location.pathname === "/states";

export function States() {
  return (
    <main>
      <h1>States</h1>
      <section aria-labelledby="states-button">
        <h2 id="states-button">Button</h2>
        <button type="button">Default</button>
        <button type="button" disabled>Disabled</button>
        <button type="button" aria-busy="true">Loading</button>
      </section>
      <section aria-labelledby="states-list">
        <h2 id="states-list">Data view</h2>
        <p data-state="empty">Empty</p>
        <p data-state="loading" aria-busy="true">Loading</p>
        <p data-state="error" role="alert">Error <button type="button">Retry</button></p>
        <p data-state="success">Success</p>
      </section>
    </main>
  );
}
