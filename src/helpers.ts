// helper to generate a URL with query parameters
function getUrlWithParams(url: string, params: { [x: string]: string }) {
  if (url.indexOf('?') < 0) url += '?';
  url += Object.keys(params)
    .map(key => key + '=' + params[key])
    .join('&');
  return url;
}

// deep copy a message
function copy(message: any) {
  return JSON.parse(JSON.stringify(message));
}

function hasProperty<K extends string>(
  x: unknown,
  name: K,
): x is { [M in K]: unknown } {
  return x instanceof Object && name in x;
}

function getJstTime(): string {
  const jstOffset = 9 * 60;
  const now = new Date();
  const offset = now.getTimezoneOffset() + jstOffset;
  now.setTime(new Date().getTime() + offset * 60 * 1000);
  const date = new Date(now);
  return `${date.getFullYear()}年${
    date.getMonth() + 1
  }月${date.getDate()}日 ${zeroPadding(date.getHours())}:${zeroPadding(
    date.getMinutes(),
  )}:${zeroPadding(date.getSeconds())}`;
}

function zeroPadding(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function buildSlackUrl(url: string): string {
  return `<a href=${url}><img alt=""Add to Slack"" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>`;
}

export { copy, getUrlWithParams, hasProperty, getJstTime, buildSlackUrl };
