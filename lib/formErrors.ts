// Messages for the ?error=<code> a dashboard form action redirects back
// with (shown by components/FormError.tsx).

export const PRODUCT_ERROR_MESSAGES: Record<string, string> = {
  name: "Product name is required.",
  photo: "The photo upload didn't work — try uploading it again.",
};

export const FLIGHT_ERROR_MESSAGES: Record<string, string> = {
  name: "Flight name is required.",
  selections: "Number of selections must be a number.",
};
