import { asText, NotFoundError } from "@prismicio/client";
import { error } from "@sveltejs/kit";

import { createClient } from "$lib/prismicio";

export async function load({ params, fetch, cookies, parent }) {
  const client = createClient({ fetch, cookies });

  let page;
  try {
    page = await client.getByUID("page", params.uid);
  } catch (e) {
    if (e instanceof NotFoundError) error(404, { message: "Page not found" });
    throw e;
  }

  const home = (await parent()).page.data;

  return {
    page,
    title: `${asText(page.data.title)} | Caltex Medical`,
    meta_description: page.data.meta_description || home.meta_description,
    meta_title: page.data.meta_title || home.meta_title,
    meta_image: page.data.meta_image.url || home.meta_image.url,
  };
}

export async function entries() {
  const client = createClient();

  const pages = await client.getAllByType("page");

  return pages.map((page) => {
    return { uid: page.uid };
  });
}
