import {
  Form,
  NavLink,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";

import { json, LinksFunction, LoaderFunctionArgs, redirect } from "@remix-run/node";
import appStylesHref from "./app.css?url";

import { createEmptyContact, getContacts } from "./data";
import { useEffect, useState } from "react";

export const action = async () => {
  const contact = await createEmptyContact();
  return redirect(`/contacts/${contact.id}/edit`);
}

export const links: LinksFunction = () => [
  {rel: "stylesheet", href: appStylesHref},
];

export const loader = async ({request}: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return json({contacts, q});
} 

export default function App() {
  const {contacts, q} = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  // keeping the query in state
  const [query, setQuery] = useState(q || "");
  const submit = useSubmit();

  // still need useEffect to to sync query to the component when going back/forward in browser
  useEffect(() => {
    setQuery(q || "");
  }, [q]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        {/* Links renders above links const, every route (tsx file) can export links and this will be linked here */}
        <Links />
      </head>
      <body>
        <div id="sidebar">
          <h1>Remix Contacts</h1>
          <div>
            <Form 
              id="search-form"
              onChange={(event) =>
                submit(event.currentTarget)
              } 
              role="search">
              <input
                id="q"
                aria-label="Search contacts"
                placeholder="Search"
                type="search"
                name="q"
                onChange={(event) => 
                  setQuery(event.currentTarget.value)
                }
                value={query}
              />
              <div id="search-spinner" aria-hidden hidden={true} />
            </Form>
            <Form method="post">
              <button type="submit">New</button>
            </Form>
          </div>
          <nav>
            {contacts.length ? (
              <ul>
                {contacts.map((contact) => (
                  <li key={contact.id}>
                    <NavLink className={({isActive, isPending}) => 
                      isActive 
                        ? "active"
                        : isPending 
                        ? "pending"
                        : ""
                    }
                    to={`contacts/${contact.id}`}
                    >
                      {contact.first || contact.last ? (
                        <>
                          {contact.first} {contact.last}
                        </>
                      ) : (
                        <i>No Name</i>
                      )}{" "}
                      {contact.favorite ? (
                        <span>★</span>
                      ) : null}
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <i>No contacts</i>
              </p>
            )}
          </nav>
        </div>
        <div 
          className={navigation.state === "loading" ? "loading" : ""}
          id="detail">
          <Outlet />
        </div>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
