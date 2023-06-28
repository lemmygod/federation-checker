import { isValidUrl } from "@/utils";
import { useState } from "react";

function HomePage() {
  const [hostname, setHostname] = useState("");
  const [data, setData] = useState<{
    blockedByInstances: string[] | undefined;
    blocksInstances: string[] | undefined;
  }>({
    blockedByInstances: [],
    blocksInstances: [],
  });
  const [notALemmyInstance, setNotALemmyInstance] = useState(false);
  const [unknownError, setUnknownError] = useState(false);
  const [invalidUrl, setInvalidUrl] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch(`/api/check?hostname=${hostname}`).catch(
        (e) => {
          // error is json, if it contains "Not a Lemmy instance" then it's not a Lemmy instance
          console.error("error inside of the fetch catch", e);
        }
      );
      console.log("response", response);
      if (!response) {
        setNotALemmyInstance(true);
        return;
      }
      const res = await response.json();
      if (!res?.error) {
        setInvalidUrl(false);
        setNotALemmyInstance(false);
        setUnknownError(false);
      }
      if (res && res.error?.includes("Not a Lemmy instance")) {
        setInvalidUrl(false);
        setUnknownError(false);
        setNotALemmyInstance(true);
        return;
      } else if (res && res.error) {
        if (!isValidUrl(hostname)) {
          setInvalidUrl(true);
          setNotALemmyInstance(false);
          setUnknownError(false);
          return;
        }
        setInvalidUrl(false);
        setNotALemmyInstance(false);
        setUnknownError(true);
        return;
      }
      try {
        const newData = res;
        setData(newData);
      } catch (e) {
        console.error(e);
      }
    } catch (e: any) {
      console.log("error outside of the fetch catch", e);
      setUnknownError(true);
    }
  };

  return (
    <div className="bg-nord1 min-h-screen min-w-full flex flex-col items-center justify-center p-4 gap-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-nord0 shadow-md rounded px-8 pt-6 pb-8 flex items-center gap-4"
      >
        <div className="w-full">
          <input
            type="text"
            value={hostname}
            onChange={(e) => setHostname(e.target.value)}
            placeholder="Enter hostname"
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-nord6 leading-tight focus:outline-none focus:shadow-outline bg-nord2"
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-nord9 hover:bg-nord14 text-nord6 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Check
          </button>
        </div>
      </form>
      {notALemmyInstance && (
        <div className="w-full max-w-md bg-nord0 shadow-md rounded px-8 pt-6 pb-8 mb-4 flex items-center mb-4 gap-4">
          <p className="text-nord6">Not a Lemmy instance</p>
        </div>
      )}
      {unknownError && (
        <div className="w-full max-w-md bg-nord0 shadow-md rounded px-8 pt-6 pb-8 mb-4 flex items-center mb-4 gap-4">
          <p className="text-nord6">Unknown error</p>
        </div>
      )}
      {invalidUrl && (
        <div className="w-full max-w-md bg-nord0 shadow-md rounded px-8 pt-6 pb-8 mb-4 flex items-center mb-4 gap-4">
          <p className="text-nord6">Invalid URL</p>
        </div>
      )}
      {hostname &&
        (data.blockedByInstances?.length ||
          data.blocksInstances?.length ||
          undefined) && (
          <div className="w-full max-w-2xl mt-6 overflow-x-auto">
            <table className="w-full divide-y divide-nord4">
              <thead>
                <tr className="bg-nord3 text-nord6">
                  <th className="px-4 py-2">Blocked By</th>
                  <th className="px-4 py-2">Blocks</th>
                </tr>
              </thead>
              <tbody className="bg-nord0 divide-y divide-nord4">
                {data.blockedByInstances?.map((blockedByInstance, index) => (
                  <tr key={index} className="text-nord6">
                    <td className="px-4 py-2">{blockedByInstance}</td>
                    <td className="px-4 py-2">
                      {data.blocksInstances?.length || undefined
                        ? data.blocksInstances?.[index]
                        : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}

export default HomePage;
