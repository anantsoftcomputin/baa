const ajaxCall = async (
  url,
  fetchObj = {},
  timeOut,
  timeOutFunction = () => {}
) => {
  try {
    const id = setTimeout(() => {
      timeOutFunction();
    }, timeOut);

    const response = await fetch(
      `https://cicinfosystems.com/baa/api/${url}`,
      fetchObj
    );

    clearTimeout(id);

    const data = await response.json();

    return {
      status: response.status,
      isError: !response.ok,
      isNetwork: false,
      data,
    };
  } catch (error) {
    return {
      status: null,
      isError: true,
      isNetwork: true,
      data: null,
      error: error,
    };
  }
};

export default ajaxCall;
