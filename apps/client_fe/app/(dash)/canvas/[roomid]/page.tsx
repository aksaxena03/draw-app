import { RoomCanvas } from "../../../components/RoomCanvas";

type PageProps = {
    params: Promise<{ roomid: string }>;
};

export default async function CanvasPage({ params }: PageProps) {
    const { roomid } = await params;
    return <RoomCanvas roomid={roomid} />;
}