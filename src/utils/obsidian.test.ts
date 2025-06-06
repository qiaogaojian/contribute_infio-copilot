import { TFile, TFolder } from 'obsidian'

import { calculateFileDistance } from './obsidian'

describe('calculateFileDistance', () => {
	// Mock TFile class
	class MockTFile extends TFile {
		path: string
		constructor(path: string) {
			super()
			this.path = path
		}
	}

	// Mock TFolder class
	class MockTFolder extends TFolder {
		path: string
		constructor(path: string) {
			super()
			this.path = path
		}
	}

	it('should calculate the correct distance between files in the same folder', () => {
		const file1 = new MockTFile('folder/file1.md')
		const file2 = new MockTFile('folder/file2.md')

		const result = calculateFileDistance(file1, file2)
		expect(result).toBe(2)
	})

	it('should calculate the correct distance between files in different subfolders', () => {
		const file1 = new MockTFile('folder1/folder2/file1.md')
		const file2 = new MockTFile('folder1/folder3/file2.md')

		const result = calculateFileDistance(file1, file2)
		expect(result).toBe(4)
	})

	it('should return null for files in different top-level folders', () => {
		const file1 = new MockTFile('folder1/file1.md')
		const file2 = new MockTFile('folder2/file2.md')

		const result = calculateFileDistance(file1, file2)
		expect(result).toBeNull()
	})

	it('should handle files at different depths', () => {
		const file1 = new MockTFile('folder1/folder2/subfolder/file1.md')
		const file2 = new MockTFile('folder1/folder3/file2.md')

		const result = calculateFileDistance(file1, file2)
		expect(result).toBe(5)
	})

	it('should return 0 for the same file', () => {
		const file = new MockTFile('folder/file.md')

		const result = calculateFileDistance(file, file)
		expect(result).toBe(0)
	})

	it('should calculate the correct distance between a folder and a file', () => {
		const file = new MockTFile('folder1/folder2/file1.md')
		const folder = new MockTFolder('folder1/folder2')
		if (!(folder instanceof TFolder)) {
			throw new Error('Expected folder to be a TFolder instance')
		}

		const result = calculateFileDistance(file, folder)
		expect(result).toBe(1)
	})
})
