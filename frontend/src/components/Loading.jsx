export default function Loading() {
    return (
        <div className="text-center mt-5">

            <div
                className="spinner-border text-primary"
                style={{ width: "4rem", height: "4rem" }}
            />

            <h4 className="mt-3">
                AI sedang menganalisis...
            </h4>

        </div>
    );
}