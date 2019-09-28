import { Page, PageProvider, PageRange } from '../page_provider';

export class TestPageProvider implements PageProvider {
  async getPages(range: PageRange): Promise<readonly Page[]> {
    const pages = [];
    for (let i = range[0]; i < range[1]; i++) {
      pages.push(this.createPage(`Page ${i}`));
    }
    return pages;
  }

  private createPage(content: string): Page {
    const loadImage = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error("couldn't retrieve canvas context");
      }
      ctx.font = '16px serif';
      ctx.fillStyle = 'blue';
      ctx.fillText(content, 30, 30);

      const uri = canvas.toDataURL('image/png');

      // Simulate loading time
      return new Promise<string>(res => {
        setTimeout(() => res(uri), 2000)
      });
    };

    return {
      loadImage,
    };
  }
}
