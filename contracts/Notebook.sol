pragma solidity >0.4.22;

contract Notebook {
    mapping(address => string [] ) private notes;

    constructor() public {
    }

    event NewNote(address, string note);

    function addNote( string memory note) public {
        notes[msg.sender].push(note);
        emit NewNote(msg.sender, note);
    }

    function getNotesLen(address own) public view returns (uint) {
        return notes[own].length;
    }
    
    function getNotes(address own, uint index) public view returns (string memory) {
        require(own == msg.sender);
        require(index < notes[own].length);
        return notes[own][index];
    }
}