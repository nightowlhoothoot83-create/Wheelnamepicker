export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname.toLowerCase() === "www.wheelnamepicker.com.au") {
      url.hostname = "wheelnamepicker.com.au";
      url.protocol = "https:";
      return Response.redirect(url.href, 301);
    }
    return env.ASSETS.fetch(request);
  }
};
