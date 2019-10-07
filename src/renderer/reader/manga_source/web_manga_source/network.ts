export class HttpClient {
  get(url: string) {
    return fetch(url, {
      method: 'GET',
    });
  }
}
