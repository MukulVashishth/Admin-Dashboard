import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faSearch } from "@fortawesome/free-solid-svg-icons";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
        );
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        console.log("Error in fetching data", error);
      }
    };
    fetchData();
  }, []);

  const handleSearch = () => {
    const filtered = users.filter((user) =>
      Object.values(user).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredUsers(filtered);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleCheckboxChange = (userId) => {
    setSelectedRows((prevSelectedRows) => {
      if (prevSelectedRows.includes(userId)) {
        return prevSelectedRows.filter((id) => id !== userId);
      } else {
        return [...prevSelectedRows, userId];
      }
    });
  };

  const handleSelectAllChange = () => {
    setSelectAllChecked((prev) => !prev);

    if (!selectAllChecked) {
      const pageStartIndex = (pages - 1) * 10;
      const pageEndIndex = pages * 10;
      const currentPageRows = filteredUsers.slice(pageStartIndex, pageEndIndex);
      const currentPageUserIds = currentPageRows.map((user) => user.id);
      setSelectedRows(currentPageUserIds);
    } else {
      setSelectedRows([]);
    }
  };

  const handleDeleteSelected = () => {
    const updatedUsers = users.filter(
      (user) => !selectedRows.includes(user.id)
    );
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers);
    setSelectedRows([]);
  };

  const selectPageHandler = (selectedPage) => {
    const totalPages = Math.ceil(filteredUsers.length / 10);

    if (
      selectedPage >= 1 &&
      selectedPage <= totalPages &&
      selectedPage !== pages
    ) {
      setPages(selectedPage);
      setSelectAllChecked(false);
    }
  };

  return (
    <>
      <div>
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleSearchKeyDown}
        />

        <button className="search-icon" onClick={handleSearch}>
          <FontAwesomeIcon icon={faSearch} />
        </button>
      </div>

      <table>
        <thead>
          <th>
            <input
              type="checkbox"
              checked={selectAllChecked}
              onChange={handleSelectAllChange}
            />
          </th>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Actions</th>
        </thead>

        <tbody>
          {filteredUsers.slice(pages * 10 - 10, pages * 10).map((user) => (
            <tr
              key={user.id}
              className={selectedRows.includes(user.id) ? "selected-row" : ""}
            >
              <td>
                <input
                  type="checkbox"
                  className="row-checkbox"
                  checked={selectedRows.includes(user.id)}
                  onChange={() => handleCheckboxChange(user.id)}
                ></input>
              </td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button className="edit">
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button className="delete">
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        className="delete-selected"
        onClick={handleDeleteSelected}
        disabled={selectedRows.length === 0}
      >
        Delete Selected
      </button>

      <div>
        <button
          onClick={() => selectPageHandler(pages - 1)}
          className={pages > 1 ? "" : "pagination__disable previous-page"}
        >
          ◀️
        </button>
        {[...Array(Math.ceil(filteredUsers.length / 10))].map((_, i) => {
          return (
            <button
              key={i}
              className={pages === i + 1 ? "pagination__selected " : ""}
              onClick={() => selectPageHandler(i + 1)}
            >
              {i + 1}
            </button>
          );
        })}
        <button
          onClick={() => selectPageHandler(pages + 1)}
          className={
            pages < Math.ceil(filteredUsers.length / 10)
              ? ""
              : "pagination__disable next-page"
          }
        >
          ▶️
        </button>
      </div>
    </>
  );
};

export default AdminDashboard;
