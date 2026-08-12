import type { PageProps } from "stoneware";
import Counter from "../islands/Counter.tsx";

export default function Home(_props: PageProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Welcome to stoneware</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <main>
          <h1>It renders on the server</h1>
          <p>
            This page is complete HTML. Edit <code>routes/index.tsx</code> and it reloads.
          </p>
          <p>The button below is an island - the only JavaScript on this page.</p>
          <Counter />
        </main>
      </body>
    </html>
  );
}
