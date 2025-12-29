export class ImagePath {
  private readonly value: string

  constructor(path: string) {
    this.validate(path)
    this.value = path
  }

  private validate(path: string): void {
    if (!path || path.trim() === '') {
      throw new Error('Image path cannot be empty')
    }
    if (path.length > 255) {
      throw new Error('Image path is too long (max 255 characters)')
    }
    if (!path.startsWith('/')) {
      throw new Error('Image path must start with "/"')
    }
  }

  getValue(): string {
    return this.value
  }
}
