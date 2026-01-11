import { useNavigate } from "react-router-dom";
import { useRouteCtx } from "../hooks/useRouteCtx";
import { Button } from "../components/common";
import { useEffect } from "react";

export default function Plan() {
  const { setBackgroundType } = useRouteCtx();
  const navigate = useNavigate();

  useEffect(() => {
    setBackgroundType("default");
  }, [setBackgroundType]);

  return (
    <div className="h-full flex items-center justify-center flex-col gap-6 p-4">
      <div className="text-xl text-gray-600 text-center">
        Enrich your ✨ trip experience ✨ with places only locals know! <br />
        Let us know about your preferences so we can tailor the best
        recommendations just for you.
      </div>
      <Button
        onClick={() => navigate("/home")}
        fullWidth
        variant="primary"
        className="text-xl"
      >
        Start planning
      </Button>
    </div>
  );
}
