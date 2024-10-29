import { expect, test } from "bun:test"
import { getFileExtension } from "../src/util/files"

test.each([
	[ "file.png", "png" ],
	[ "thumbnail.avif", "avif" ],
	[ "http://example.com/My_Book.pdf", "pdf" ],
	[ "https://jkorpela.fi/fileurl.html", "html" ],
	[ "https://cdn.discordapp.com/attachments/730267766665379962/1300658368502824960/IMG_0915.png?ex=67224cc0&is=6720fb40&hm=9dab1fd083a8b3a86cfb422ad7e77b3493cd34ac183d2211fd840203576ba031&", "png" ],
	[ "https://x.com/hausofdecline/status/1850880855301910672", "" ],
	[ "file://vms.host.edu/disk$user/my/notes/note12345.txt", "txt" ],
	[ "DISK$USER:[MY.NOTES]NOTE123456.TXT", "txt" ],
	[ "file:///C|/W95/Calc.exe", "exe" ],
	[ "file://localhost/c:/WINDOWS/clock.avi", "avi" ],
	[ "file://./sharename/path/to/the%20file.txt", "txt" ],
	[ "https://example.com/fold.er/fil.e.jpg?param.eter#hash=12.345", "jpg" ]
])('Get File Extension', (url: string, expected) => {
	expect(getFileExtension(url)).toBe(expected)
})