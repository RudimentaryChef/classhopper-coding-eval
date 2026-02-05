
type Props = {
    user_id: string;
}

const rc = [{ courseName: "hello", courseID: "1" }, { courseName: "world", courseID: "2" }]

const RegisteredClasses = ({ user_id }: Props) => {
    return (
        <div>{"RC" + user_id}</div>
    )
}

export default RegisteredClasses