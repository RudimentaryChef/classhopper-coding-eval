type Props = {
    user_id: string;
}

const sc = [{ courseName: "Math", courseID: "1" }, { courseName: "Science", courseID: "2" }, { courseName: "English", courseID: "3" }]

const SavedClasses = ({ user_id }: Props) => {
    return (
        <div>{"SC" + user_id}</div>
    )
}

export default SavedClasses