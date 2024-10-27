import '@argon/components/navbar/post/post-nav.css'

interface Props {
	savePost: Function
	deletePost: Function
}
export default function EditPostNav({ savePost, deletePost }: Props) {
	return (
		<div className="post-nav">
			{ /* Cancel */ }
			<a href="./" id="cancel-button" className="button focusable">
				<img className="button-icon" src="/icons/nav/cancel.svg" alt="Cancel" />
			</a>
			
			{ /* Save */ }
			<a href="#" id="save-button" className="button focusable" onClick={() => savePost()}>
				<img className="button-icon" src="/icons/nav/save.svg" alt="Save" />
			</a>

			{ /* Delete */ }
			<a href="#" id="delete-button" className="button focusable" onClick={() => deletePost()}>
				<img className="button-icon" src="/icons/nav/delete.svg" alt="Delete" />
			</a>
		</div>
	)
}